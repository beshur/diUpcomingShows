'use strict'

const moment = require('moment')

class ReportFormatter {
  format(report) {
    let result = '<h2>Server Report</h2>'

    result += 'Uptime: ' + moment.duration(report.uptime, 's').humanize()
    result += '<h3>Timers</h3>'

    report.timers.forEach(timer => {
      result += `<strong>${timer.id}</strong> &mdash; `
      result += moment(timer.createdAt).add(timer.delay, 'ms').fromNow()
      result += '<br />'
    })

    if (!report.timers.length) {
      result += 'No timers set'
    }

    return result
  }
}

module.exports = ReportFormatter
