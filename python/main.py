import cv2
import pandas as pd
from imutils.video import FPS
from ultralytics import YOLO
from tracker import Tracker
import json
import argparse
import time
import paho.mqtt.client as mqtt
import subprocess
import torch

# device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

# MQTT settings
MQTT_BROKER = "103.245.38.40"
MQTT_PORT = 1883
MQTT_TOPIC = "vehicle/interactions"

# Initialize MQTT client
mqtt_client = mqtt.Client()
mqtt_client.connect(MQTT_BROKER, MQTT_PORT, 60)

# Vehicle types to detect
VEHICLE_TYPES = ['bus', 'car', 'motorcycle', 'truck']

def load_model(path):
    # Hanya memuat model, label sudah ada di dalam model
    return YOLO(path)

def get_detections(frame, model):
    results = model.predict(frame)
    
    # Dictionary untuk menyimpan deteksi berdasarkan jenis kendaraan
    vehicle_detections = {vehicle_type: [] for vehicle_type in VEHICLE_TYPES}
    
    # Dengan Ultralytics YOLO, model sudah menangani label
    for result in results:
        boxes = result.boxes
        
        for box in boxes:
            # Dapatkan koordinat
            x1, y1, x2, y2 = map(int, box.xyxy[0].tolist())
            
            # Dapatkan confidence
            confidence = float(box.conf)
            
            # Dapatkan class id
            class_id = int(box.cls)
            
            # Dapatkan label dari model (sudah ditangani oleh Ultralytics)
            label = result.names[class_id].lower()
            
            # Periksa untuk setiap jenis kendaraan
            detected = False
            for vehicle_type in VEHICLE_TYPES:
                if vehicle_type in label:
                    vehicle_detections[vehicle_type].append([x1, y1, x2, y2])
                    detected = True
                    break
            
            # Untuk debugging
            if not detected and confidence > 0.5:
                print(f"Detected object with label '{label}' but not categorized as a vehicle")
    
    return vehicle_detections

def draw_bboxes(frame, vehicle_type, bbox_ids):
    # Warna untuk berbagai jenis kendaraan (sama dengan di mark_object)
    colors = {
        'car': (0, 0, 255),      # Merah
        'motorcycle': (0, 255, 0), # Hijau
        'bus': (255, 0, 0),      # Biru
        'truck': (255, 255, 0)   # Cyan
    }
    
    color = colors.get(vehicle_type, (0, 0, 255))
    
    for bbox in bbox_ids:
        x1, y1, x2, y2, obj_id = bbox
        # Gambar bounding box
        cv2.rectangle(frame, (x1, y1), (x2, y2), color, 2)
        
        # Tampilkan label kendaraan dan ID
        label = f"{vehicle_type}_{obj_id}"
        # Memberikan background hitam untuk teks agar lebih jelas
        text_size = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.5, 1)[0]
        cv2.rectangle(frame, (x1, y1-20), (x1+text_size[0], y1), color, -1)
        cv2.putText(frame, label, (x1, y1-5), 
                   cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1)

def mark_object(frame, cx, cy, obj_id, vehicle_type):
    # Different colors for different vehicle types
    colors = {
        'car': (0, 0, 255),      # Red
        'motorcycle': (0, 255, 0), # Green
        'bus': (255, 0, 0),      # Blue
        'truck': (255, 255, 0)   # Cyan
    }
    
    color = colors.get(vehicle_type, (0, 0, 255))
    cv2.circle(frame, (cx, cy), 4, color, -1)
    cv2.putText(frame, f"{vehicle_type[:3]}_{obj_id}", (cx, cy), 
                cv2.FONT_HERSHEY_COMPLEX, 0.6, (255, 255, 255), 2)

def draw_lines(frame, cy1, cy2):
    cv2.line(frame, (10, cy1), (620, cy1), (255, 255, 255), 1)
    cv2.putText(frame, 'Line 1', (80, cy1 - 10), cv2.FONT_HERSHEY_COMPLEX, 0.6, (0, 255, 255), 2)
    
    cv2.line(frame, (10, cy2), (620, cy2), (255, 255, 255), 1)
    cv2.putText(frame, 'Line 2', (80, cy2 - 10), cv2.FONT_HERSHEY_COMPLEX, 0.6, (0, 255, 255), 2)

def publish_data(counts):
    # Format data for MQTT with specific key naming as requested
    data = {
        f"{vehicle_type}_down": len(counts[vehicle_type]['down']) for vehicle_type in VEHICLE_TYPES
    }
    
    # Add the "_up" counts
    for vehicle_type in VEHICLE_TYPES:
        data[f"{vehicle_type}_up"] = len(counts[vehicle_type]['up'])
    
    mqtt_client.publish(MQTT_TOPIC, json.dumps(data))
    return data

def draw_counters(frame, counts):
    y_offset = 40
    
    # Colors for different vehicle types
    colors = {
        'car': (0, 0, 255),      # Red
        'motorcycle': (0, 255, 0), # Green
        'bus': (255, 0, 0),      # Blue
        'truck': (255, 255, 0)   # Cyan
    }
    
    # Draw counts for each vehicle type only (no total)
    for vehicle_type in VEHICLE_TYPES:
        down_count = len(counts[vehicle_type]['down'])
        up_count = len(counts[vehicle_type]['up'])
        color = colors.get(vehicle_type, (0, 255, 255))
        
        cv2.putText(frame, f'{vehicle_type.capitalize()}:', 
                    (60, y_offset), cv2.FONT_HERSHEY_COMPLEX, 0.7, color, 2)
        y_offset += 30
        
        cv2.putText(frame, f'  Down: {down_count}', 
                    (60, y_offset), cv2.FONT_HERSHEY_COMPLEX, 0.6, (0, 255, 255), 2)
        y_offset += 30
        
        cv2.putText(frame, f'  Up: {up_count}', 
                    (60, y_offset), cv2.FONT_HERSHEY_COMPLEX, 0.6, (0, 255, 255), 2)
        y_offset += 40
    
    return frame

def draw_fps(frame, num_frames, elapsed_time):
    fps = num_frames / elapsed_time if elapsed_time > 0 else 0
    txt_fps = f"FPS: {fps:.2f}"
    cv2.putText(frame, txt_fps, (310, 20), cv2.FONT_HERSHEY_COMPLEX, 0.7, (0, 255, 255), 2)
    return frame

def reconnect_stream(video_source, max_retries=5, retry_interval=5):
    for attempt in range(max_retries):
        cap = cv2.VideoCapture(video_source)
        if cap.isOpened():
            return cap
        print(f"Attempt {attempt+1}/{max_retries} to connect to video source failed.")
        time.sleep(retry_interval)
    return None

def main(model_path, rtmp_url, video_source='../malam2.mp4'):
    # Initialize trackers for each vehicle type
    trackers = {vehicle_type: Tracker() for vehicle_type in VEHICLE_TYPES}
    
    # Counter variables
    count = 0
    cy1, cy2, offset = 390, 450, 14
    
    # Initialize persistent vehicle positions for counting
    vh_down = {vehicle_type: {} for vehicle_type in VEHICLE_TYPES}
    vh_up = {vehicle_type: {} for vehicle_type in VEHICLE_TYPES}
    
    # Initialize counters for each vehicle type
    counters = {vehicle_type: {'down': [], 'up': []} for vehicle_type in VEHICLE_TYPES}
    
    # Connect to video source
    cap = reconnect_stream(video_source)
    if cap is None:
        print("Failed to connect to video source after multiple attempts.")
        return
    
    # Performance tracking
    fps_counter = FPS().start()
    start_time = time.time()
    num_frames = 0
    
    # Load model - tidak perlu file label lagi
    model = load_model(model_path)
    
    # Start FFmpeg process for streaming
    ffmpeg_cmd = [
        'ffmpeg',
        '-y',
        '-f', 'rawvideo',
        '-vcodec', 'rawvideo',
        '-pix_fmt', 'bgr24',
        '-s', '640x480',
        '-r', '15',
        '-i', '-',
        '-g', '15',
        '-c:v', 'libx264',
        '-b:v', '300k',
        '-preset', 'ultrafast',
        '-maxrate', '300k',
        '-bufsize', '600k',
        '-pix_fmt', 'yuv420p',
        '-g', '30',
        '-f', 'flv',
        rtmp_url,
    ]
    ffmpeg_process = subprocess.Popen(ffmpeg_cmd, stdin=subprocess.PIPE)
    
    print("Detection started. Press 'q' to quit.")
    
    while True:
        ret, frame = cap.read()
        if not ret:
            print("Error reading frame. Attempting to reconnect...")
            cap.release()
            cap = reconnect_stream(video_source)
            if cap is None:
                print("Failed to reconnect. Exiting.")
                break
            continue
        
        count += 1
        # Skip frames for performance
        if count % 3 != 0:
            continue
        
        frame = cv2.resize(frame, (640, 480))
        
        # Get detections for all vehicle types
        vehicle_detections = get_detections(frame, model)
        
        # Process detections for each vehicle type
        for vehicle_type in VEHICLE_TYPES:
            # Update trackers with new detections
            bbox_ids = trackers[vehicle_type].update(vehicle_detections[vehicle_type])
            
            # Gambar bounding box untuk semua kendaraan yang terdeteksi
            draw_bboxes(frame, vehicle_type, bbox_ids)
            
            # Process each tracked object for counting
            for bbox in bbox_ids:
                x1, y1, x2, y2, obj_id = bbox
                cx = int((x1 + x2) // 2)
                cy = int((y1 + y2) // 2)
                
                # Process downward movement
                if cy1 - offset < cy < cy1 + offset:
                    vh_down[vehicle_type][obj_id] = cy
                if obj_id in vh_down[vehicle_type] and cy2 - offset < cy < cy2 + offset:
                    mark_object(frame, cx, cy, obj_id, vehicle_type)
                    if obj_id not in counters[vehicle_type]['down']:
                        counters[vehicle_type]['down'].append(obj_id)
                
                # Process upward movement
                if cy2 - offset < cy < cy2 + offset:
                    vh_up[vehicle_type][obj_id] = cy
                if obj_id in vh_up[vehicle_type] and cy1 - offset < cy < cy1 + offset:
                    mark_object(frame, cx, cy, obj_id, vehicle_type)
                    if obj_id not in counters[vehicle_type]['up']:
                        counters[vehicle_type]['up'].append(obj_id)
        
        # Draw lines and counters
        draw_lines(frame, cy1, cy2)
        draw_counters(frame, counters)
        
        # Update FPS counter
        num_frames += 1
        elapsed_time = time.time() - start_time
        draw_fps(frame, num_frames, elapsed_time)
        
        # Publish data to MQTT
        if num_frames % 15 == 0:  # Publish every 15 frames to reduce network traffic
            publish_data(counters)
        
        # Write frame to FFmpeg process
        try:
            ffmpeg_process.stdin.write(frame.tobytes())
        except BrokenPipeError:
            print("Connection to streaming server lost. Attempting to reconnect...")
            ffmpeg_process.stdin.close()
            ffmpeg_process.wait()
            ffmpeg_process = subprocess.Popen(ffmpeg_cmd, stdin=subprocess.PIPE)
        
        # Display the frame
        cv2.imshow('Multi-Vehicle Counter', frame)
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break
    
    # Clean up
    fps_counter.stop()
    print(f"Elapsed time: {fps_counter.elapsed():.2f}")
    print(f"Approximate FPS: {fps_counter.fps():.2f}")
    
    cap.release()
    cv2.destroyAllWindows()
    ffmpeg_process.stdin.close()
    ffmpeg_process.wait()

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Multi-vehicle detection and counting.')
    parser.add_argument('--model', default='./yolov5nupre.pt', help='Model path')
    parser.add_argument('--rtmp', default='rtmp://103.245.38.40/live/test', help='RTMP URL')
    parser.add_argument('--source', default='../malam2.mp4', help='Video source path or RTSP URL')
    args = parser.parse_args()

    main(args.model, args.rtmp, args.source)