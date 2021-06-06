FROM docker.io/alanmpinder/gitql-api-base:20210425

# "Work" image, used to hold application config

EXPOSE 3000

COPY "work" "/work"

# Install Nest CLI tools
RUN yarn global add @nestjs/cli@7.6.0

ENTRYPOINT [ "/work/entrypoint.sh" ]
