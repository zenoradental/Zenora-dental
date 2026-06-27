import os

css = """
/* Restored Premium Booking UI Styles */
.services-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
}
.service-card {
    cursor: pointer;
    position: relative;
    display: block;
}
.service-radio, .date-radio, .time-radio {
    position: absolute;
    opacity: 0;
    width: 0;
    height: 0;
}
.service-card-inner {
    padding: 16px;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    background: #fff;
    font-weight: 500;
    color: #475569;
    text-align: center;
    transition: all 0.2s ease;
}
.service-radio:checked + .service-card-inner,
.date-radio:checked + .service-card-inner,
.time-radio:checked + .service-card-inner {
    border-color: #14b8a6;
    background: rgba(20, 184, 166, 0.05);
    color: #14b8a6;
    box-shadow: 0 4px 6px -1px rgba(20, 184, 166, 0.1);
}
.service-card:hover .service-card-inner {
    border-color: #cbd5e1;
}

.dates-scroll {
    display: flex;
    overflow-x: auto;
    gap: 12px;
    padding-bottom: 8px;
    scrollbar-width: none;
}
.dates-scroll::-webkit-scrollbar {
    display: none;
}
.date-card-inner {
    padding: 12px 20px;
    min-width: max-content;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    background: #fff;
    font-weight: 500;
    color: #475569;
    text-align: center;
    transition: all 0.2s ease;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    line-height: 1.4;
}
.date-card-inner span.month {
    font-size: 12px;
    color: #94a3b8;
    text-transform: uppercase;
    font-weight: 600;
}
.date-card-inner span.day {
    font-size: 16px;
    font-weight: 700;
}

.time-grid {
    grid-template-columns: repeat(3, 1fr);
}
.time-card-inner {
    padding: 12px;
    font-size: 14px;
}
"""

with open(r'd:\WEBSITES\THE ZEHOSP\ZEMORA DENTAL\assets\css\booking.css', 'a', encoding='utf-8') as f:
    f.write("\n" + css)
