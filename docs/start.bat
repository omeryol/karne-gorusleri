@echo off
title Karne Yorumu Asistanı - Yerel Sunucu

echo Karne Yorumu Asistani icin yerel sunucu baslatiliyor...
echo Sunucu adresi: http://localhost:8000/
echo.
echo Bu pencereyi kapatmayin, aksi takdirde sunucu duracaktir.
echo.

REM Tarayiciyi ac ve index.html sayfasina yonlendir
start http://localhost:8000/index.html

REM py komutunu kullanarak Python'ın http.server modulunu baslat
py -m http.server 8000

echo.
echo Sunucu durduruldu. Pencereyi kapatmak icin bir tusa basin...
pause > NUL