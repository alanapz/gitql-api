# Base image used only to fix system dependencies
FROM alpine:20210212

RUN apk add --no-cache coreutils=8.32-r2 bash=5.1.4-r0 git=2.32.0-r0 yarn=1.22.10-r0 nodejs=14.17.0-r0 openssh=8.6_p1-r1
RUN yarn global add ts-node@9.1.1 @nestjs/cli@7.6.0

ENTRYPOINT [ "/bin/false" ]
