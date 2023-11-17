require('./config/globals');
const express = require('express');
const bodyParser = require('body-parser');
const uploadRoutes = require('./routes/uploads');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use('/uploads', uploadRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
