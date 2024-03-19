FROM java:8
WORKDIR /app

VOLUME /log

#设置时区
RUN /bin/cp /usr/share/zoneinfo/Asia/Shanghai /etc/localtime && echo 'Asia/Shanghai' >/etc/timezone

COPY basis-schedule-v2.jar app.jar

ENTRYPOINT ["java","-Dfile.encoding=UTF-8","-jar","/app/app.jar","--spring.profiles.active=stage","--org.jobrunr.background-job-server.enabled=true","--org.jobrunr.dashboard.enabled=false"]