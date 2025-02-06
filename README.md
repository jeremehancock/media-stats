# MediaStats

## Simple Plex Media Stats

![Default Mode Screenshot](public/screenshots/media-stats-default.png)

![Dark Mode Screenshot](public/screenshots/media-stats-dark.png)

### Docker Run

```bash
docker pull bozodev/mediastats:latest
```


```bash
docker run -d --name=mediastats -p 3778:3778 --restart unless-stopped bozodev/mediastats:latest
```


### Docker Compose

Create docker-compose.yml:

```bash
services:
  nextjs:
    image: bozodev/mediastats:latest
    ports:
      - "3778:3778"

    container_name: mediastats
    restart: unless-stopped
```

```bash
docker-compose pull
```

```bash
docker-compose up -d
```


## License

[MIT License](LICENSE)

## AI Assistance Disclosure

This tool was developed with assistance from AI language models.