// ==UserScript==
// @name         OT
// @namespace    http://tampermonkey.net/
// @version      0.9
// @description  Highlight rows with work hours over 8 hours and show overtime
// @author       Bomtvc
// @match        https://int.rochdalespears.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=tampermonkey.net
// @grant        none
// @require      https://code.jquery.com/jquery-3.6.0.min.js
// @require      https://momentjs.com/downloads/moment.min.js
// ==/UserScript==

(function() {
    'use strict';

    let totalOvertime = 0; // Tổng thời gian tăng ca
    let ot1 = 0; // Tổng OT1 (tăng ca các ngày khác Chủ nhật)
    let ot2 = 0; // Tổng OT2 (tăng ca ngày Chủ nhật)

    function highlightRows() {
        $('tr').each(function() {
            var $tds = $(this).find('td');
            if ($tds.length > 3) {
                var startTime = "08:00";  // Thời gian bắt đầu làm việc cố định
                var endTime = $tds.eq(3).text().trim();  // Thời gian kết thúc làm việc
                var date = $tds.eq(1).text().trim();  // Ngày tháng

                var start = moment(startTime, "HH:mm");
                var end = moment(endTime, "HH:mm");
                var day = moment(date, "DD MMM YYYY").day(); // Lấy thứ trong tuần

                // Tính tổng thời gian làm việc
                var duration = moment.duration(end.diff(start));
                var hoursWorked = duration.asHours() - 0.5; // Trừ 30 phút nghỉ trưa

                // Tính thời gian tăng ca
                var overtime;
                if (day === 0) { // Chủ nhật
                    overtime = hoursWorked;
                } else if (day === 6) { // Thứ 7
                    overtime = hoursWorked - 8 + 0.5; // Cộng thêm 30 phút cho ngày thứ 7
                } else { // Các ngày còn lại
                    overtime = hoursWorked - 8;
                }
                overtime = overtime < 0 ? 0 : (Math.floor(overtime * 2) / 2).toFixed(1); // Làm tròn đến 0.5 giờ

                // Cộng dồn tổng thời gian tăng ca
                totalOvertime += parseFloat(overtime);

                // Cộng dồn OT1 và OT2
                if (day === 0) {
                    ot2 += parseFloat(overtime); // Thời gian tăng ca ngày Chủ nhật
                } else {
                    ot1 += parseFloat(overtime); // Thời gian tăng ca các ngày khác Chủ nhật
                }

                // Tô màu nền hàng
                if (hoursWorked > 8.5 || day === 0) {
                    if (day === 0) {
                        $(this).css('background-color', 'red'); // Ngày Chủ nhật có tăng ca
                    } else if (day === 6) {
                        $(this).css('background-color', 'yellow'); // Ngày thứ 7 có tăng ca
                    } else {
                        $(this).css('background-color', 'lightgreen'); // Ngày thường có tăng ca
                    }
                }

                // Thêm cột thời gian tăng ca nếu là ngày chủ nhật hoặc nếu thời gian làm việc > 8.5 giờ
                if (day === 0 || hoursWorked > 8.5) {
                    $tds.eq(4).after('<td>' + overtime + ' giờ</td>'); // Thêm cột thời gian tăng ca
                }
            }
        });

        // Hiển thị thống kê
        $('body').append(
            '<div id="ot-summary" style="position: fixed; bottom: 10px; right: 10px; background: white; padding: 10px; border: 1px solid black;">' +
            '<p>Tổng thời gian tăng ca: ' + totalOvertime.toFixed(1) + ' giờ</p>' +
            '<p>OT1 (Tăng ca các ngày khác Chủ nhật): ' + ot1.toFixed(1) + ' giờ</p>' +
            '<p>OT2 (Tăng ca ngày Chủ nhật): ' + ot2.toFixed(1) + ' giờ</p>' +
            '</div>'
        );
    }

    // Đợi cho trang tải xong rồi thực thi
    $(document).ready(highlightRows);
})();
