# 🌊 Web River Trash Monitoring Setup (Rocky Linux)

Dokumen ini menjelaskan langkah-langkah untuk menginstal dan mengonfigurasi sistem **Web River Trash Monitoring** pada **Rocky Linux**.

---

## 📦 Persiapan Sistem

### 1. Update sistem & install dependensi dasar
```bash
sudo dnf update -y
sudo dnf install epel-release -y
```

---

## 🔧 Instalasi Node.js (via NVM)

### 2. Install NVM
```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
source ~/.bashrc
```

### 3. Install Node.js versi 22
```bash
nvm install 22
node -v
npm -v
```

---

## 🛢️ Instalasi & Setup MariaDB

### 4. Install MariaDB
```bash
sudo dnf install mariadb-server mariadb -y
sudo systemctl start mariadb
sudo systemctl enable mariadb
sudo systemctl status mariadb
```

### 5. Konfigurasi awal MariaDB
```bash
sudo mysql_secure_installation
```

**Ikuti panduan berikut saat ditanya:**
```
- Enter current password for root: (tekan Enter)
- Switch to unix_socket authentication [Y/n]: y
- Change the root password? [Y/n]: y
    - New password: password
    - Re-enter new password: password
- Remove anonymous users? [Y/n]: y
- Disallow root login remotely? [Y/n]: n
- Remove test database and access to it? [Y/n]: y
- Reload privilege tables now? [Y/n]: y
```

---

## 🔧 Instalasi Alat Tambahan

### 6. Install Git & Nano (opsional)
```bash
sudo dnf install git nano -y
```

Cek versi:
```bash
git --version
nano --version
```

---

## 🗂️ Clone Repository

### 7. Clone Project
```bash
git clone https://github.com/alimurrofid/web-river-trash-monitoring.git
```

---

## ⚙️ Setup Backend

### 8. Masuk ke direktori backend
```bash
cd ~/web-river-trash-monitoring/Backend
```

### 9. Install dependensi
```bash
npm install
```

### 10. Salin dan konfigurasi file environment
```bash
cp .env.example .env
nano .env
```

### 11. Jalankan migrasi database
```bash
npm run migrate:fresh
```

### 12. Isi data awal (seeding)
```bash
npm run db:seed
```

### 13. Build backend untuk production
```bash
npm run build
```

> 🔁 Jika Anda mengubah isi `.env`, lakukan `npm run build` ulang.

### 14. Jalankan backend
```bash
npm run start
```

### 15. Akses backend di browser:
```
http://<IP-SERVER>:3000
```

---

## 🚀 Menjalankan Backend dengan PM2

### 16. Install PM2 secara global
```bash
npm install -g pm2
```

### 17. Jalankan backend dengan PM2
```bash
cd ~/web-river-trash-monitoring/Backend
pm2 start npm --name backend -- run start
pm2 save
```

---

## 🎨 Setup Frontend

### 18. Masuk ke direktori frontend
```bash
cd ~/web-river-trash-monitoring/Frontend
```

### 19. Install dependensi
```bash
npm install
```

### 20. Salin dan konfigurasi file environment
```bash
cp .env.example .env
nano .env
```

### 21. Build frontend untuk production
```bash
npm run build
```

> 🔁 Jika `.env` berubah, lakukan build ulang.

### 22. Jalankan preview lokal
```bash
npm run preview -- --host
```

---

## 🌐 Setup NGINX sebagai Reverse Proxy

### 23. Install & aktifkan NGINX
```bash
sudo dnf install nginx -y
sudo systemctl enable --now nginx
```

### 24. Konfigurasi NGINX
Buat file konfigurasi:
```bash
sudo nano /etc/nginx/conf.d/web-river-trash-monitoring.conf
```

Isi konfigurasi:
```nginx
server {
    listen 80;
    server_name 192.168.137.200; # Ganti dengan IP/domain server Anda

    root /home/rofid/web-river-trash-monitoring/Frontend/dist; # Ganti dengan path ke direktori build frontend
    index index.html;

    location / {
        try_files $uri /index.html;
    }

    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 25. Validasi & restart NGINX
```bash
sudo nginx -t
sudo systemctl restart nginx
```

---
## 🌟 Akses Aplikasi
Akses aplikasi di browser:
```
http://<IP-SERVER>
```
## 📋 Catatan Tambahan
### Pastikan:
- IP server atau domain sudah benar di konfigurasi NGINX
- Port 80/443 tidak diblokir oleh firewall
- SELinux tidak menghalangi akses (lihat troubleshooting di bawah)

## ✅ Manajemen & Troubleshooting
### Cek status SELinux (Jika frontend tidak tampil)
```bash
sestatus
```

Jika status `enabled` dan `enforcing`, beri izin akses:
```bash
sudo chcon -Rt httpd_sys_content_t /home/rofid/web-river-trash-monitoring/Frontend/dist
sudo systemctl reload nginx
```

### Cek status & log PM2:
```bash
pm2 status
pm2 logs backend
```