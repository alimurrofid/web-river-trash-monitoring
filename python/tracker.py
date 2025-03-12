import math

class Tracker:
    def __init__(self):
        # Menyimpan posisi pusat objek
        self.center_points = {}
        # Menyimpan bounding box terakhir
        self.bbox_points = {}
        # Menyimpan jumlah ID
        self.id_count = 0

    def update(self, objects_rect):
        # Kotak objek dan ID
        objects_bbs_ids = []

        # Mendapatkan titik pusat objek baru
        for rect in objects_rect:
            x1, y1, x2, y2 = rect
            cx = (x1 + x2) // 2
            cy = (y1 + y2) // 2

            # Mencari tahu apakah objek tersebut sudah terdeteksi
            same_object_detected = False
            for id, pt in self.center_points.items():
                dist = math.hypot(cx - pt[0], cy - pt[1])

                if dist < 40:  # Jika jarak pusatnya kurang dari threshold
                    self.center_points[id] = (cx, cy)
                    self.bbox_points[id] = (x1, y1, x2, y2)
                    objects_bbs_ids.append([x1, y1, x2, y2, id])
                    same_object_detected = True
                    break

            # Objek baru terdeteksi, berikan ID ke objek tersebut
            if not same_object_detected:
                self.center_points[self.id_count] = (cx, cy)
                self.bbox_points[self.id_count] = (x1, y1, x2, y2)
                objects_bbs_ids.append([x1, y1, x2, y2, self.id_count])
                self.id_count += 1

        # Membersihkan dictionary dengan menghapus ID yang tidak digunakan lagi
        new_center_points = {}
        new_bbox_points = {}
        for obj_bb_id in objects_bbs_ids:
            _, _, _, _, object_id = obj_bb_id
            center = self.center_points[object_id]
            bbox = self.bbox_points[object_id]
            new_center_points[object_id] = center
            new_bbox_points[object_id] = bbox

        # Memperbarui dictionary dengan ID yang tidak digunakan dihapus
        self.center_points = new_center_points.copy()
        self.bbox_points = new_bbox_points.copy()

        return objects_bbs_ids