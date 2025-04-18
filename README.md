﻿# Combo

A web application that helps users find local businesses and services based on geolocation. Built with Next.js, this application allows users to search for businesses near their location, view them on a map, and access their business cards with details.

## Features

- Location-based business search
- Interactive business map display
- Detailed business cards with information
- Admin dashboard for business management
- Responsive design with Tailwind CSS

## Tech Stack

- [Next.js](https://nextjs.org/) - React framework for server-rendered applications
- [Prisma](https://www.prisma.io/) - Database ORM
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [TypeScript](https://www.typescriptlang.org/) - Typed JavaScript

## Getting Started

### Prerequisites

- Node.js (v16 or later)
- pnpm (preferred package manager)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/samuelbaldasso/Combo.git
   cd Combo
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory with the required variables (see `.env.example` for reference).

4. Set up the database:
   ```bash
   pnpm prisma db push
   ```

5. Run the development server:
   ```bash
   pnpm dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Project Structure

- `/app` - Next.js app directory with pages and routes
- `/components` - React components including business-card and business-map
- `/hooks` - Custom React hooks
- `/lib` - Utility functions and libraries
- `/prisma` - Database schema and migrations
- `/public` - Static assets
- `/styles` - Global styles and theme configurations

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
