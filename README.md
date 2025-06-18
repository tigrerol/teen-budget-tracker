# Teen Budget Tracker 💰

A modern, mobile-first budget tracking application designed specifically for teenagers to learn financial literacy through gamification, expense tracking, and savings goal management.

![Teen Budget Tracker](https://img.shields.io/badge/Status-Production%20Ready-green)
![Next.js](https://img.shields.io/badge/Next.js-15.3-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Docker](https://img.shields.io/badge/Docker-Ready-blue)

## ✨ Features

- 📱 **Mobile-First Design** - Optimized for smartphones with touch-friendly interface
- 🎯 **Demo Account** - Try instantly without registration
- 💶 **Euro Currency** - German locale formatting (€123,45)
- 📊 **Budget Management** - Set spending limits and track progress
- 🏷️ **Custom Categories** - Organize transactions with icons and colors
- 🎮 **Gamification Ready** - Foundation for achievements and streaks
- 🔒 **Privacy-Focused** - Self-hosted with SQLite database
- 🐳 **Docker Ready** - One-command deployment

## 🚀 Quick Start

### Option 1: Docker (Recommended)

```bash
# Clone the repository
git clone <repository-url>
cd teen-budget-tracker

# Build and run with Docker
./build-standalone.sh
./run-standalone.sh

# Visit http://localhost:3001
```

### Option 2: Docker Compose

```bash
# Clone and start
git clone <repository-url>
cd teen-budget-tracker

# Copy and configure environment
cp .env.example .env
# Edit .env with your settings

# Start with docker-compose
docker-compose up -d

# Visit http://localhost:3001
```

### Option 3: Development

```bash
# Clone the repository
git clone <repository-url>
cd teen-budget-tracker

# Install dependencies
npm install

# Set up database
npm run db:generate
npm run db:push

# Start development server
npm run dev

# Visit http://localhost:3000
```

## 📱 Demo Account

- Click **"Try Demo Account"** on the login page
- No registration required
- Pre-populated with sample data
- Full functionality available

## 🏗️ Architecture

### Technology Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **UI Components**: shadcn/ui, Tailwind CSS
- **Database**: Prisma ORM with SQLite
- **Authentication**: NextAuth.js with demo provider
- **State Management**: React Query (TanStack Query)
- **Testing**: Jest, React Testing Library

### Project Structure

```
teen-budget-tracker/
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── (dashboard)/     # Dashboard routes
│   │   ├── api/            # API routes
│   │   └── auth/           # Authentication pages
│   ├── components/         # React components
│   │   ├── ui/            # shadcn/ui components
│   │   ├── navigation/    # Navigation components
│   │   └── auth/          # Auth components
│   ├── lib/               # Utilities
│   └── types/             # TypeScript types
├── prisma/                # Database schema
├── public/                # Static assets
└── docker/                # Docker configuration
```

## 🐳 Docker Deployment

### Standalone Deployment

```bash
# Build the image
docker build -t teen-budget-tracker .

# Run the container
docker run -d \\
  --name teen-budget-tracker \\
  --restart unless-stopped \\
  -p 3001:3001 \\
  -v teen_budget_data:/app/data \\
  -e NEXTAUTH_SECRET="your-secret-key" \\
  teen-budget-tracker:latest
```

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | Yes | `file:/app/data/teen-budget.db` | SQLite database path |
| `NEXTAUTH_URL` | Yes | `http://localhost:3001` | Application URL |
| `NEXTAUTH_SECRET` | Yes | - | JWT signing secret |
| `GOOGLE_CLIENT_ID` | No | - | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | No | - | Google OAuth secret |
| `GITHUB_ID` | No | - | GitHub OAuth client ID |
| `GITHUB_SECRET` | No | - | GitHub OAuth secret |
| `PORT` | No | `3001` | Application port |

### Production Setup

1. **Generate secure secrets**:
   ```bash
   # Generate a secure NEXTAUTH_SECRET
   openssl rand -base64 32
   ```

2. **Configure environment**:
   ```bash
   cp .env.example .env
   # Edit .env with your production values
   ```

3. **Deploy with Docker Compose**:
   ```bash
   docker-compose up -d
   ```

## 🧪 Testing

### Run Tests

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run in watch mode
npm run test:watch
```

### Test Coverage

- ✅ Currency utilities (100% coverage)
- ✅ Authentication components
- ✅ Navigation components
- ✅ Form validation
- ✅ Error handling

## 🔧 Development

### Setup Development Environment

```bash
# Install dependencies
npm install

# Set up database
npm run db:generate
npm run db:push

# Start development server
npm run dev
```

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Lint code |
| `npm test` | Run tests |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:push` | Push schema to database |

### Database Management

```bash
# Generate Prisma client
npm run db:generate

# Push schema changes
npm run db:push

# Reset database (development only)
rm prisma/dev.db
npm run db:push
```

## 📊 Database Schema

### Core Models

- **User** - User accounts and profiles
- **Category** - Transaction categories with icons/colors
- **Transaction** - Income and expense records
- **Budget** - Spending limits and periods

### Sample Data

The demo account includes:
- 6 default categories (income/expense)
- Sample transactions
- Monthly budget examples
- Realistic financial data for teens

## 🔒 Security

### Production Checklist

- [ ] Generate strong `NEXTAUTH_SECRET`
- [ ] Use HTTPS in production
- [ ] Secure database file permissions
- [ ] Regular backups of SQLite database
- [ ] Monitor container logs
- [ ] Update dependencies regularly

### Data Privacy

- ✅ No external analytics or tracking
- ✅ Self-hosted with full data control
- ✅ SQLite database stays on your server
- ✅ Demo account for testing without signup
- ✅ No personal data required

## 📱 Mobile Features

### Progressive Web App (PWA)

- ✅ Installable on mobile devices
- ✅ Offline-ready foundation
- ✅ Native app-like experience
- ✅ Touch-optimized interface

### Responsive Design

- ✅ Mobile-first CSS approach
- ✅ Bottom navigation on mobile
- ✅ Desktop horizontal navigation
- ✅ Adaptive card layouts

## 🎯 Roadmap

### Phase 2 (Planned)
- [ ] Savings goals tracking
- [ ] Advanced analytics and charts
- [ ] Data export functionality
- [ ] Achievement system

### Phase 3 (Future)
- [ ] Family account sharing
- [ ] Educational content modules
- [ ] Multi-currency support
- [ ] Advanced budgeting features

## 🐛 Troubleshooting

### Common Issues

**Database not found**
```bash
# Recreate database
rm prisma/dev.db
npm run db:push
```

**Permission denied**
```bash
# Fix Docker permissions
sudo chown -R 1001:1001 /path/to/data/volume
```

**Port already in use**
```bash
# Change port in docker-compose.yml or stop conflicting service
docker-compose down
```

### Logs

```bash
# Container logs
docker logs teen-budget-tracker

# Real-time logs
docker logs -f teen-budget-tracker
```

## 📝 License

MIT License - see LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📞 Support

- 📖 **Documentation**: See `/docs` folder
- 🐛 **Issues**: GitHub Issues
- 💬 **Discussions**: GitHub Discussions

---

**Made with ❤️ for teenagers learning financial literacy**