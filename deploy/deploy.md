
ce connecter sur le serveur www.jelobox.fr

cd /var/www/tmplanning.jelobox.fr
git pull origin main
npm install --omit=dev   # production uniquement
pm2 restart tmplanning
pm2 status
  
  
cd /var/www/tmplanning.jelobox.fr && git pull origin main && npm install --omit=dev && pm2 restart tmplanning

