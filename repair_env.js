const fs = require('fs');
const content = `NEXT_PUBLIC_SUPABASE_URL=https://fqodbptmucpkatygxawm.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sb_secret_yLaQ6CDBGt33Yn5PmrQaFA_ZY6FOB12
GEMINI_API_KEY=AIzaSyDyy_E4jbsQ8JFT1HyYvVCoxwMHsIhmPQo
MONGODB_URI=mongodb://localhost:27017/crm
REDIS_URL=redis://localhost:6379
FACEBOOK_ACCESS_TOKEN=EAAVpJsZArBNEBQHTVX1UqxHhYTKR7H9mbWgSgDrKBWaultvmMN2JJyaz8dSdzZCFRfBZBjG6jkZAJBWYtoAZC1xCwRl4OAYoIjJlar9UZBCg4emJLpThJL75SZAfzKZBJBVbSDh4feT987iZAFmr9uIvbTmkrhHSZB0RPl2JPbOyJcNpLqFnywe19h2YQSi1hYjx2opXcEy7RdSk9J6sl7tuMcqlzBZAImlsvCASW1ZA
`;
fs.writeFileSync('.env.local', content);
console.log('Fixed .env.local');
