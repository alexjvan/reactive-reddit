const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

module.exports = function(app) {
  console.log('🔧 setupProxy.js loaded - registering /api/corscall');
  
  app.get('/api/corscall', async (req, res) => {
    console.log('📡 Proxy request received for:', req.query.url);
    try {
      const targetUrl = req.query.url;
      
      if (!targetUrl) {
        return res.status(400).json({ error: 'Missing url parameter' });
      }

      console.log('🌐 Fetching:', targetUrl);
      const response = await fetch(targetUrl);
      
      const contentType = response.headers.get('content-type');
      console.log('✅ Response:', response.status, contentType, 'bytes:', response.headers.get('content-length'));
      
      res.set('Content-Type', contentType);
      const buffer = await response.arrayBuffer();
      res.send(Buffer.from(buffer));
    } catch (err) {
      console.error('❌ Proxy error:', err);
      res.status(500).json({ error: 'Proxy failed', message: err.message });
    }
  });
};
