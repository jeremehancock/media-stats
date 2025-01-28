# MediaStats

## Simple Plex Media Stats

![Default Mode Screenshot](public/screenshots/media-stats-default.png)

![Dark Mode Screenshot](public/screenshots/media-stats-dark.png)
### Docker Run

`docker pull bozodev/mediastats:latest`

`docker run -d --name=mediastats -p 3778:3778 --restart unless-stopped bozodev/mediastats:latest`

### Docker Compose

Create docker-compose.yml:

```
services:
  nextjs:
    image: bozodev/mediastats:latest
    ports:
      - "3778:3778"

    container_name: mediastats
    restart: unless-stopped
```

`docker-compose pull`

`docker-compose up -d`

## AI Assistance Disclosure

This tool was developed with assistance from AI language models.

## Disclaimer

All code is provided as-is without any warranty.

## License

This project is licensed under the MIT License - see the LICENSE file for details.