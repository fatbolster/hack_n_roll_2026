# J3 Project

## Frontend Deployment

1. Open terminal
2. Change directory into the frontend folder
3. Install necessary dependencies using npm
```bash
npm install
```
4. To run the website on localhost, run "npm run dev" on terminal.

```bash
npm run dev
```

Alternatively, use pnpm dev if pnpm is installed

```bash
pnpm dev
```

4. Open http://localhost:3000/ to view webpage

## Backend Deployment

1. Open terminal
2. Change directory into the backend folder

```bash
cd backend
```

3. Install Python dependencies

```bash
pip install -r requirements.txt
```

4. Create a `.env` file in the backend directory with your OpenAI API key

```bash
OPENAI_API_KEY=your_openai_api_key_here
```

5. Run the FastAPI server using uvicorn

```bash
uvicorn main:app --reload
```

6. The backend API will be available at http://localhost:8000
7. View API documentation at http://localhost:8000/docs
