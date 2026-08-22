# Suggested Repository Structure

```text
weathergpt/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── store/
│   │   └── utils/
│   └── package.json
│
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── models/
│   │   ├── middleware/
│   │   ├── utils/
│   │   └── config/
│   └── package.json
│
├── ai-service/
│   ├── app/
│   │   ├── agents/
│   │   ├── tools/
│   │   ├── prompts/
│   │   └── services/
│   └── requirements.txt
│
├── weather-ml/
│   ├── data/
│   ├── notebooks/
│   ├── models/
│   └── src/
│
├── gis-alerts/
│   ├── src/
│   └── data/
│
├── docs/
│   ├── README.md
│   ├── (All md files)...
│
├── docker-compose.yml
└── .gitignore
```

## Rule
Keep frontend, backend, AI, ML, GIS, and documentation separated enough that team members can work independently while sharing stable APIs.
