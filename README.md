# MediaStats

Simple Plex Media Stats

### Docker Run

`docker pull bozodev/media-stats:latest`

`docker run -d --name=media-stats -p 3778:3778 --restart unless-stopped bozodev/media-stats:latest`

### Docker Compose

Create docker-compose.yml:

```
services:
  nextjs:
    image: bozodev//media-stats:latest
    ports:
      - "3778:3778"

    container_name: /media-stats
    restart: unless-stopped
```

`docker-compose pull`

`docker-compose up -d`
