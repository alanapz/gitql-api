# Work image, entrypoint reclones repo if necessary
FROM docker.io/alanmpinder/gitql-api-base:20210613

EXPOSE 3000

COPY "work" "/work"

ENTRYPOINT [ "/work/entrypoint.sh" ]
