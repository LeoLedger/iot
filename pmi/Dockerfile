FROM adoptopenjdk/openjdk8-openj9
WORKDIR /app
# 81:api 84:jobrunr
EXPOSE 8081 8084
VOLUME /log

#设置时区
RUN /bin/cp /usr/share/zoneinfo/Asia/Shanghai /etc/localtime && echo 'Asia/Shanghai' >/etc/timezone

COPY pmi-wapi-v2.jar app.jar

ENTRYPOINT ["java","-Dfile.encoding=UTF-8","-jar","/app/app.jar","--spring.profiles.active=stage", "--logging.file=/log/log.txt","--org.jobrunr.background-job-server.enabled=false","--org.jobrunr.dashboard.enabled=true"]