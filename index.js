require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dns = require('dns');
const app = express();

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Configuración básica
const port = process.env.PORT || 3000;

// Servir archivos estáticos
app.use('/public', express.static(`${process.cwd()}/public`));

// Página principal
app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Primer endpoint de prueba
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

// Simular base de datos en memoria
let urls = [];
let id = 1;

// POST para acortar la URL
app.post('/api/shorturl', (req, res) => {
  const originalUrl = req.body.url;
  console.log('URL recibida:', originalUrl);

  let hostname;
  try {
    const parsedUrl = new URL(originalUrl); // Verifica si la URL tiene un formato válido
    hostname = parsedUrl.hostname;
    console.log('Hostname:', hostname);
  } catch (error) {
    console.error('Error de formato en la URL:', error);
    return res.json({ error: 'invalid url' });
  }

  // Usar dns.lookup para verificar si el dominio existe
  dns.lookup(hostname, (err, address, family) => {
    if (err) {
      console.error('Error de DNS:', err);
      return res.json({ error: 'invalid url' });
    }

    // Si la URL es válida, agregarla a la lista de URLs acortadas
    const shortUrl = id++;
    urls.push({ original_url: originalUrl, short_url: shortUrl });
    console.log('URL acortada:', { original_url: originalUrl, short_url: shortUrl });
    res.json({ original_url: originalUrl, short_url: shortUrl });
  });
});

// Redirección al visitar la URL acortada
app.get('/api/shorturl/:shortUrl', (req, res) => {
  const shortUrl = parseInt(req.params.shortUrl, 10);
  const urlData = urls.find(u => u.short_url === shortUrl);

  if (urlData) {
    console.log('Redirigiendo a:', urlData.original_url);
    res.redirect(urlData.original_url);
  } else {
    console.error('No se encontró URL acortada para:', shortUrl);
    res.json({ error: 'No short URL found' });
  }
});

// Escuchar en el puerto configurado
app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
