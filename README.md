# Trison Solar - React Native + FastAPI Application

A complete mobile application with React Native frontend and FastAPI backend for solar energy management.

## 🏗️ Architecture

- **Frontend**: React Native (TypeScript)
- **Backend**: FastAPI (Python)
- **Database**: PostgreSQL (Neon.tech)
- **Authentication**: JWT with OTP verification
- **State Management**: Redux Toolkit

## 🚀 Quick Start

### Prerequisites

- Python 3.8+
- Node.js 18+
- React Native CLI
- Redis (optional, for OTP storage)

### 1. Clone and Setup

```bash
git clone <repository-url>
cd trison
```

### 2. Environment Configuration

```bash
# Copy environment template
cp env.example .env

# Edit .env file with your configuration
# Update SECRET_KEY and other values as needed
```

### 3. Start Both Services

```bash
# Make startup script executable
chmod +x start.sh

# Run both FastAPI and React Native
./start.sh
```

This will:
- Create Python virtual environment
- Install Python dependencies
- Start FastAPI backend on http://localhost:8000
- Start React Native Metro bundler
- Open API documentation at http://localhost:8000/docs

### 4. Run on Device/Simulator

```bash
# For Android
npx react-native run-android

# For iOS
npx react-native run-ios
```

## 📱 Features

### Authentication
- Phone number + OTP login
- JWT token management
- Automatic token refresh
- Secure logout

### User Management
- User registration
- Profile management
- Points system
- Referral codes

### QR Code Scanning
- QR code generation
- Scan and verify
- Points earning

## 🔧 API Endpoints

### Authentication
- `POST /api/v1/auth/send-otp` - Send OTP
- `POST /api/v1/auth/verify-otp` - Verify OTP
- `POST /api/v1/auth/login` - Login
- `POST /api/v1/auth/register` - Register
- `POST /api/v1/auth/refresh` - Refresh token
- `POST /api/v1/auth/logout` - Logout
- `GET /api/v1/auth/me` - Get current user

### Documentation
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## 🗄️ Database Schema

### Users Table
- `id` - Primary key
- `phone_number` - Unique phone number
- `email` - Optional email
- `first_name`, `last_name` - User names
- `role` - User role (client, retailer, admin)
- `is_verified` - Phone verification status
- `total_points` - Earned points
- `referral_code` - Unique referral code
- `created_at`, `updated_at` - Timestamps
- `last_login` - Last login time
- `login_count` - Number of logins

## 🔐 Security Features

- JWT token authentication
- Password hashing with bcrypt
- OTP verification for phone numbers
- Token blacklisting on logout
- Secure password storage

## 📦 Dependencies

### Backend (Python)
- FastAPI - Web framework
- SQLAlchemy - ORM
- PostgreSQL - Database
- Redis - Cache/OTP storage
- JWT - Authentication
- Pydantic - Data validation

### Frontend (React Native)
- React Native - Mobile framework
- Redux Toolkit - State management
- AsyncStorage - Local storage
- React Navigation - Navigation
- TypeScript - Type safety

## 🛠️ Development

### Backend Development
```bash
# Activate virtual environment
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run FastAPI with auto-reload
python main.py
```

### Frontend Development
```bash
# Install Node dependencies
npm install

# Start Metro bundler
npx react-native start

# Run on device/simulator
npx react-native run-android
npx react-native run-ios
```

## 🧪 Testing

```bash
# Backend tests
pytest

# Frontend tests
npm test
```

## 📊 Monitoring

- Health check: http://localhost:8000/health
- API status: http://localhost:8000/
- Logs are displayed in console

## 🚨 Troubleshooting

### Common Issues

1. **Port 8000 already in use**
   ```bash
   lsof -ti:8000 | xargs kill -9
   ```

2. **Metro bundler issues**
   ```bash
   npx react-native start --reset-cache
   ```

3. **Database connection issues**
   - Check Neon.tech connection string
   - Verify network connectivity
   - Check SSL requirements

4. **Redis connection issues**
   - Start Redis service
   - Check Redis configuration

## 📝 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `SECRET_KEY` | JWT secret key | Required |
| `DATABASE_URL` | PostgreSQL connection | Neon.tech URL |
| `REDIS_URL` | Redis connection | localhost:6379 |
| `DEBUG` | Debug mode | false |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the API documentation
- Review the troubleshooting section
