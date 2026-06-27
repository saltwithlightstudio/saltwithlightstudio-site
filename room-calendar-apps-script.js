const CALENDAR_ID = 'saltlight2103@gmail.com';
const PUBLIC_ICAL_URL = 'https://calendar.google.com/calendar/ical/saltlight2103%40gmail.com/public/basic.ics';

function doGet(e) {
  const params = e && e.parameter ? e.parameter : {};
  const start = parseDateParam(params.start) || startOfMonth(new Date());
  const end = parseDateParam(params.end) || addMonths(start, 1);
  const callback = /^[A-Za-z_$][\w$]*$/.test(params.callback || '') ? params.callback : '';
  const calendar = CalendarApp.getCalendarById(CALENDAR_ID);
  let events = calendar ? calendar.getEvents(start, end).map(toPublicEvent) : [];
  if (!events.length) events = getPublicIcalEvents(start, end);
  const payload = JSON.stringify({ events });

  if (callback) {
    return ContentService
      .createTextOutput(`${callback}(${payload});`)
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }

  return ContentService
    .createTextOutput(payload)
    .setMimeType(ContentService.MimeType.JSON);
}

function toPublicEvent(event) {
  const start = event.getStartTime();
  const end = event.getEndTime();
  const publicTitle = sanitizePublicText(event.getTitle()) || '已預約';

  return {
    title: publicTitle,
    start: start.toISOString(),
    end: end.toISOString()
  };
}

function sanitizePublicText(value) {
  return String(value || '')
    .replace(/[０-９]/g, function(digit) {
      return String.fromCharCode(digit.charCodeAt(0) - 0xfee0);
    })
    .replace(/(?:\+?886[-\s]?)?0?9\d{2}[-\s]?\d{3}[-\s]?\d{3}|0\d{1,2}[-\s]?\d{6,8}/g, '****')
    .replace(/(?:聯絡電話|電話|手機)[:：]?\s*/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

function getPublicIcalEvents(start, end) {
  const response = UrlFetchApp.fetch(PUBLIC_ICAL_URL, { muteHttpExceptions: true });
  if (response.getResponseCode() < 200 || response.getResponseCode() >= 300) return [];

  const text = unfoldIcalLines(response.getContentText());
  const blocks = text.match(/BEGIN:VEVENT[\s\S]*?END:VEVENT/g) || [];

  return blocks.map(parseIcalEvent)
    .filter(function(event) {
      return event && event.startDate >= start && event.startDate < end;
    })
    .map(function(event) {
      return {
        title: sanitizePublicText(event.title) || '已預約',
        start: event.startDate.toISOString(),
        end: event.endDate ? event.endDate.toISOString() : event.startDate.toISOString()
      };
    });
}

function unfoldIcalLines(text) {
  return String(text || '').replace(/\r?\n[ \t]/g, '');
}

function parseIcalEvent(block) {
  const startLine = getIcalLine(block, 'DTSTART');
  if (!startLine) return null;

  const endLine = getIcalLine(block, 'DTEND');
  const summaryLine = getIcalLine(block, 'SUMMARY') || '';
  const startDate = parseIcalDate(startLine);
  if (!startDate) return null;

  return {
    title: decodeIcalText(summaryLine),
    startDate: startDate,
    endDate: parseIcalDate(endLine) || startDate
  };
}

function getIcalLine(block, name) {
  const match = new RegExp('^' + name + '(?:;[^:]*)?:(.*)$', 'm').exec(block);
  return match ? match[1].trim() : '';
}

function parseIcalDate(value) {
  if (!value) return null;

  const dateTime = /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z?$/.exec(value);
  if (dateTime) {
    const parts = dateTime.slice(1).map(Number);
    if (value.endsWith('Z')) {
      return new Date(Date.UTC(parts[0], parts[1] - 1, parts[2], parts[3], parts[4], parts[5]));
    }
    return new Date(parts[0], parts[1] - 1, parts[2], parts[3], parts[4], parts[5]);
  }

  const dateOnly = /^(\d{4})(\d{2})(\d{2})$/.exec(value);
  if (dateOnly) {
    const parts = dateOnly.slice(1).map(Number);
    return new Date(parts[0], parts[1] - 1, parts[2]);
  }

  return null;
}

function decodeIcalText(value) {
  return String(value || '')
    .replace(/\\n/g, ' ')
    .replace(/\\,/g, ',')
    .replace(/\\;/g, ';')
    .replace(/\\\\/g, '\\');
}

function parseDateParam(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(value || ''))) return null;
  const parts = value.split('-').map(Number);
  return new Date(parts[0], parts[1] - 1, parts[2]);
}

function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function addMonths(date, count) {
  return new Date(date.getFullYear(), date.getMonth() + count, 1);
}
