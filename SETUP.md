# Setup Instructions for Bus Pass Management System

## Prerequisites
- MySQL Server installed and running
- Java 21 installed
- Node.js installed
- Maven installed

## Database Setup

### 1. Create the Database
Open MySQL command line or MySQL Workbench and run:
```sql
CREATE DATABASE bus_pass_db;
```

### 2. Run the Schema Script
Execute the schema file located at:
`app/src/main/resources/schema.sql`

You can run it using MySQL command line:
```bash
mysql -u root -p bus_pass_db < "d:\VIT\sem-4\Projects\Java CP\app\src\main\resources\schema.sql"
```

Or copy and paste the contents into MySQL Workbench and execute.

### 3. Default Users Created
The schema includes two default users:

**Admin User:**
- Email: `admin@buspass.com`
- Password: `admin123`
- Role: ADMIN

**Student User:**
- Email: `student@example.com`
- Password: `student123`
- Role: STUDENT

## Backend Setup

### 1. Navigate to the app directory
```bash
cd "d:\VIT\sem-4\Projects\Java CP\app"
```

### 2. Install dependencies
```bash
mvn clean install
```

### 3. Run the Spring Boot application
```bash
mvn spring-boot:run
```

The backend will start on: `http://localhost:8081`

## Frontend Setup

### 1. Navigate to the frontend directory
```bash
cd "d:\VIT\sem-4\Projects\Java CP\bus-pass-frontend"
```

### 2. Create .env file
Create a `.env` file in the frontend directory with:
```
VITE_BASE_URL=http://localhost:8081
```

### 3. Install dependencies
```bash
npm install
```

### 4. Run the development server
```bash
npm run dev
```

The frontend will start on: `http://localhost:5173`

## Testing the Application

### 1. Test Registration
1. Open `http://localhost:5173`
2. Click "Register"
3. Fill in the form:
   - Name: Test User
   - Email: test@example.com
   - Password: test123
   - Role: Student
   - Phone: 1234567890
4. Click "Register"
5. You should be redirected to login

### 2. Test Login
1. Use one of the default users or your newly registered user
2. Email: `admin@buspass.com`
3. Password: `admin123`
4. Click "Login"
5. You should be redirected to the appropriate dashboard

### 3. Verify JWT Token
1. After logging in, open browser DevTools (F12)
2. Go to Application tab → Local Storage
3. You should see:
   - `token`: JWT token string
   - `user`: User information (email, role, name)

### 4. Test Protected Endpoints
1. Try accessing `/admin` without logging in - should redirect to login
2. Login as student - should not be able to access `/admin`
3. Login as admin - should access `/admin` successfully

## Troubleshooting

### Backend Issues
- **Port 8081 already in use**: Change port in `application.properties`
- **Database connection failed**: Check MySQL is running and credentials are correct
- **JWT errors**: Verify `jwt.secret` is set in `application.properties`

### Frontend Issues
- **CORS errors**: Verify backend CORS configuration includes `http://localhost:5173`
- **API calls failing**: Check `VITE_BASE_URL` in `.env` file
- **Token not stored**: Check browser console for errors

### Database Issues
- **Schema.sql errors**: Make sure database `bus_pass_db` exists first
- **Foreign key constraints**: Run the DROP TABLE commands in the schema first
