FROM freeradius/freeradius-server:latest-alpine

COPY raddb/ /etc/raddb/

COPY entrypoint.sh /usr/local/bin/entrypoint.sh

RUN chmod +x /usr/local/bin/entrypoint.sh

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]