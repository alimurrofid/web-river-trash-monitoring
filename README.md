# Web River Trash Monitoring

**Web River Trash Monitoring** is a web-based river trash monitoring system designed to facilitate real-time river condition monitoring through cameras installed at strategic points. This system displays AI-based visual detection results sent via **MQTT** protocol and provides live video streaming services through **NGINX RTMP** server.

This platform is specifically developed to integrate with detection devices running on **Raspberry Pi 5** equipped with **Hailo-8 AI** accelerator that has computing power of up to 26 TOPS, as described in the **[river-trash-monitoring](https://github.com/alimurrofid/river-trash-monitoring/tree/main/raspberrypi_hailoai)** repository.

The hardware used is the **[reComputer AI R2130-12](https://www.seeedstudio.com/reComputer-AI-R2130-12-p-6368.html)** from Seeed Studio, designed for efficient edge AI processing.

This system integrates AI-based visual detection processes, data transmission via MQTT, and presentation of detection calculation results through a web interface. Detected trash will be classified and counted based on two main parameters:

**Material type**: categorized as plastic or non-plastic

**Physical size**:
- **Meso**: trash with size between 0.5 cm to 2.5 cm
- **Macro**: trash with size more than 2.5 cm to 1 meter

Through this approach, users can directly monitor the quantity and types of detected trash, providing useful information for sustainable river environmental condition monitoring.

---

## 🚀 Requirements
- Node.js v22.x
- MySQL

---

## ⚙️ Installation

### Clone the Repository
Clone the repository:
```bash
git clone https://github.com/alimurrofid/web-river-trash-monitoring.git
```

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd Backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy the `.env.example` file to `.env` and configure your environment variables:
   ```bash
   cp .env.example .env
   ```
4. Run the migrations to set up the database:
   ```bash
   npm run migrate:fresh
   ```
5. Seed the database with initial data:
   ```bash
   npm run db:seed
   ```
6. Start the backend server:
   ```bash
   npm run dev
   ```
7. Build the backend for production:
   ```bash
   npm run build
   ```
8. Start the backend server in production mode:
   ```bash
   npm run start
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd Frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy the `.env.example` file to `.env` and configure your environment variables:
   ```bash
   cp .env.example .env
   ```
4. Start the frontend server:
   ```bash
   npm run dev
   ```
5. Build the frontend for production:
   ```bash
   npm run build
   ```
6. Preview frontend in production mode:
   ```bash
   npm run preview
   ```

## 💻 Usage
After both backend and frontend are running, you can access the application through your browser by visiting:
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3000`

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

## 🙋‍♂️ Author

**Muhammad 'Ali Murrofid**  
GitHub: [@alimurrofid](https://github.com/alimurrofid)  
LinkedIn: [Muhammad 'Ali Murrofid](https://www.linkedin.com/in/muhammad-ali-murrofid-320a2b254/)

---

## ⭐️ Support the Project

If you find this project useful, feel free to give it a ⭐ on GitHub to show your support!