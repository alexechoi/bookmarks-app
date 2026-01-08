# LinkMind - Bookmarks App

![Next.js](https://img.shields.io/badge/Next.js_16-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React_19-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Expo](https://img.shields.io/badge/Expo_54-000020?style=for-the-badge&logo=expo&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)
![Terraform](https://img.shields.io/badge/Terraform-7B42BC?style=for-the-badge&logo=terraform&logoColor=white)
![Google Cloud](https://img.shields.io/badge/Google_Cloud-4285F4?style=for-the-badge&logo=googlecloud&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)

<img width="1437" height="958" alt="image" src="https://github.com/user-attachments/assets/d2e69a91-64bb-4951-9956-af84361cb9c7" />

<img width="912" height="2048" alt="image" src="https://github.com/user-attachments/assets/ef0895e2-aeb9-42a3-8ab7-76d58d5f5b79" />

A full-stack bookmarks management application with web frontend, mobile app, and API backend.

| Component                         | Stack                            |
| --------------------------------- | -------------------------------- |
| [frontend/](./frontend/README.md) | Next.js 16 + React 19 + Tailwind |
| [backend/](./backend/README.md)   | FastAPI + Python 3.13            |
| [expo-app/](./expo-app/README.md) | Expo 54 + React Native           |
| [infra/](./infra/README.md)       | Terraform (GCP, Firebase, CI/CD) |

---

## Development

### Prerequisites

- Node.js 20+
- Python 3.13+
- [uv](https://docs.astral.sh/uv/) (Python package manager)

### Run Locally

```bash
# Backend
cd backend
export GOOGLE_APPLICATION_CREDENTIALS=./firebase-service-account.json
uv sync && uv run python main.py  # http://localhost:8000

# Frontend (new terminal)
cd frontend
npm install && npm run dev  # http://localhost:3000

# Mobile (new terminal)
cd expo-app
npm install && npm run prebuild
npm run ios  # or npm run android
```

---

## Documentation

- [Frontend Setup](./frontend/README.md)
- [Backend Setup](./backend/README.md)
- [Mobile App Setup](./expo-app/README.md)
- [Infrastructure Details](./infra/README.md)
