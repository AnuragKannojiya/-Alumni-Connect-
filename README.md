# 🎓 Alumni Connect – A Shared Digital Space for Every Campus

A lightweight, college-specific social platform where **students and alumni** can **interact meaningfully**, post memories, advice, and job opportunities — all within a **dedicated community feed** per college.

---

## 🚀 Live Demo

> 🔗 **Frontend**: [Vercel Link](#)  
> 🔗 **Backend API**: [Render/Railway Link](#)  
> 🔗 **Replit Source**: [Replit Workspace](#)

---

## 📌 Challenge
Built for the **#CommunityApps** & **#Auth** challenge.

> Many colleges lack a dedicated space for students and alumni to connect. This platform bridges that gap by providing a clean, college-specific wall for collaboration, sharing, mentorship, and career growth.

---

## 🛠️ Tech Stack

| Layer     | Tech Used                                 |
|-----------|--------------------------------------------|
| Frontend  | **Next.js**, **Tailwind CSS**, Vercel      |
| Backend   | **Node.js**, **Express.js**, Replit        |
| Database  | **MongoDB Atlas**                          |
| Auth      | JWT-based Authentication                   |
| Storage   | Cloudinary / Firebase (for post images)    |
| Deployment| Vercel (Frontend), Railway/Render (Backend)|

---

## ✨ Features

### ✅ Core Functionality
- 🎓 **College-Specific Communities**
  - Separate feed per college (chosen on signup)
- 🔐 **Role-Based Access**
  - Users select: `Student` or `Alumnus`
- 📝 **Post System**
  - Text + optional image + tags (`Jobs`, `Advice`, `Memories`)
- ❤️ **Like & Comment**
  - Engage on posts inside your college wall
- 🔎 **Tag & Date Filters**
  - Filter by tags or recent posts

---

### 🌟 Bonus Features (Optional – In Progress)
- ✉️ **Email/Admin Verification**
- 🧑‍💼 **Job Board** tab for alumni
- 📅 **Event Announcements**
- 🧠 **Mentorship Requests**
- 🧑‍🤝‍🧑 **Searchable Alumni Directory**
- 🏷️ **Department Filter**

---

## 📚 API Documentation

All endpoints are scoped to a user's **college**. JWT token required for protected routes.

### Auth & User

POST   /api/auth/signup        → Register user
POST   /api/auth/login         → Login and get JWT
GET    /api/user/me            → Get current user profile
PUT    /api/user/update        → Edit profile

Posts

POST   /api/posts              → Create post
GET    /api/posts              → Fetch feed (filtered by tag/department)
GET    /api/posts/:id          → Post details
POST   /api/posts/:id/like     → Like/unlike post
POST   /api/posts/:id/comment  → Add comment
Bonus

POST   /api/jobs               → Post a job (Alumni only)
GET    /api/jobs               → View job listings
POST   /api/events             → Post an event
GET    /api/events             → View events
GET    /api/directory          → Search users by batch/department
🗂️ Project Structure

/client     → Frontend (Next.js + Tailwind)
/server     → Backend (Express.js)
/models     → MongoDB Schemas
/routes     → Express Routes
/controllers → Business Logic
/middleware → Auth & College Guards
.env        → Secrets and config
📦 Setup Instructions (on Replit)
🔧 Backend (server/)

1. Fork this repo to your Replit account
2. Go to `server/` directory
3. Create `.env` file with:

MONGO_URI=<your-mongodb-uri>
JWT_SECRET=<your-jwt-secret>
CLOUDINARY_API_KEY=<optional>
...

4. Run the server:
npm install
npm start
✅ Tip: Use MongoDB Atlas + Replit Secrets panel for safety.

💻 Frontend (client/)

1. Go to `client/` directory
2. Create `.env.local`:

NEXT_PUBLIC_API_BASE_URL=http://localhost:5000

3. Run the frontend:
npm install
npm run dev
✅ After building, deploy frontend to Vercel

🌍 Deployment
✅ Frontend
Deploy /client folder on https://vercel.com

✅ Backend
Deploy /server on:

https://render.com

or https://railway.app

🎯 Judging Criteria (How This Project Meets It)
Criteria	✅ Addressed?
Clarity & Usability	✔️ Clean UI, college-based feeds
Segregated Logic	✔️ Users can only see their college feed
UX Design	✔️ Clear role, tags, and feed view
Bonus Features	✔️ (Working on jobs/events/chat)

🙌 Future Scope
Admin dashboard

Push notifications

Real-time chat via Socket.io

Alumni badges / experience timelines

👨‍💻 Authors
Built by [Your Name] as part of the #CommunityApps challenge.
Contributions and forks welcome!

📝 License
This project is licensed under the MIT License.


---

Let me know if you'd like:
- This as a downloadable `.md` file
- A pre-filled `.env.example` template
- GitHub project board (kanban setup)
- Auto-generation of code for Express + Next.js
