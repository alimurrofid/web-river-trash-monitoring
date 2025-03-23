import math

class Tracker:
    def __init__(self, distance_threshold=40, max_disappeared=10):
        # Menyimpan posisi pusat objek
        self.center_points = {}
        # Menyimpan bounding box terakhir
        self.bbox_points = {}
        # Counter untuk objek yang hilang sementara
        self.disappeared = {}
        # Menyimpan jumlah ID
        self.id_count = 0
        # Threshold jarak untuk mencocokkan objek
        self.distance_threshold = distance_threshold
        # Batas maksimum frame objek hilang sebelum dianggap benar-benar hilang
        self.max_disappeared = max_disappeared

    def update(self, objects_rect):
        # Kotak objek dan ID
        objects_bbs_ids = []
        
        # Jika tidak ada objek yang terdeteksi
        if len(objects_rect) == 0:
            # Tambahkan counter untuk setiap objek yang sudah dilacak
            for object_id in list(self.disappeared.keys()):
                self.disappeared[object_id] += 1
                
                # Jika objek sudah hilang terlalu lama, hapus dari pelacakan
                if self.disappeared[object_id] > self.max_disappeared:
                    self.center_points.pop(object_id, None)
                    self.bbox_points.pop(object_id, None)
                    self.disappeared.pop(object_id, None)
            
            # Kembalikan daftar kosong karena tidak ada objek yang terdeteksi
            return objects_bbs_ids
        
        # Inisialisasi array untuk pusat objek baru
        input_centroids = []
        
        # Mendapatkan titik pusat objek baru
        for rect in objects_rect:
            x1, y1, x2, y2 = rect
            cx = (x1 + x2) // 2
            cy = (y1 + y2) // 2
            input_centroids.append((cx, cy))
        
        # Jika belum ada objek yang dilacak, tambahkan semua objek baru
        if len(self.center_points) == 0:
            for i, centroid in enumerate(input_centroids):
                x1, y1, x2, y2 = objects_rect[i]
                self.center_points[self.id_count] = centroid
                self.bbox_points[self.id_count] = (x1, y1, x2, y2)
                self.disappeared[self.id_count] = 0
                objects_bbs_ids.append([x1, y1, x2, y2, self.id_count])
                self.id_count += 1
        else:
            # Daftar ID objek yang sudah ada
            object_ids = list(self.center_points.keys())
            # Pusat objek yang sudah ada
            object_centroids = list(self.center_points.values())
            
            # Menghitung jarak antara setiap pasangan pusat objek
            distances = {}
            for i, centroid in enumerate(input_centroids):
                distances[i] = {}
                for j, obj_id in enumerate(object_ids):
                    obj_centroid = object_centroids[j]
                    dist = math.hypot(centroid[0] - obj_centroid[0], centroid[1] - obj_centroid[1])
                    distances[i][obj_id] = dist
            
            # Cocokkan objek berdasarkan jarak terdekat
            used_objects = set()
            used_inputs = set()
            
            # Cocokkan objek baru dengan objek lama
            for i in range(len(input_centroids)):
                if i in used_inputs:
                    continue
                    
                min_dist = float('inf')
                min_id = None
                
                # Cari objek lama terdekat
                for obj_id in object_ids:
                    if obj_id in used_objects:
                        continue
                        
                    dist = distances[i][obj_id]
                    if dist < min_dist and dist < self.distance_threshold:
                        min_dist = dist
                        min_id = obj_id
                
                # Jika objek lama ditemukan
                if min_id is not None:
                    x1, y1, x2, y2 = objects_rect[i]
                    self.center_points[min_id] = input_centroids[i]
                    self.bbox_points[min_id] = (x1, y1, x2, y2)
                    self.disappeared[min_id] = 0
                    objects_bbs_ids.append([x1, y1, x2, y2, min_id])
                    used_objects.add(min_id)
                    used_inputs.add(i)
            
            # Tambahkan objek baru yang belum dicocokkan
            for i in range(len(input_centroids)):
                if i not in used_inputs:
                    x1, y1, x2, y2 = objects_rect[i]
                    self.center_points[self.id_count] = input_centroids[i]
                    self.bbox_points[self.id_count] = (x1, y1, x2, y2)
                    self.disappeared[self.id_count] = 0
                    objects_bbs_ids.append([x1, y1, x2, y2, self.id_count])
                    self.id_count += 1
            
            # Update counter untuk objek yang hilang
            for obj_id in object_ids:
                if obj_id not in used_objects:
                    self.disappeared[obj_id] += 1
                    # Jika objek masih dianggap ada (belum hilang terlalu lama)
                    if self.disappeared[obj_id] <= self.max_disappeared:
                        x1, y1, x2, y2 = self.bbox_points[obj_id]
                        objects_bbs_ids.append([x1, y1, x2, y2, obj_id])
                    # Jika objek sudah hilang terlalu lama
                    elif self.disappeared[obj_id] > self.max_disappeared:
                        self.center_points.pop(obj_id, None)
                        self.bbox_points.pop(obj_id, None)
                        self.disappeared.pop(obj_id, None)
        
        return objects_bbs_ids