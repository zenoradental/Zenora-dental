const fs = require('fs');

// Helper to generate the base HTML with a specific icon placement
const generateIdeaHTML = (title, patientName, iconSvg, placement) => {
  const iconHtml = `<div style="display: inline-block; width: 24px; height: 24px; color: #475569;">${iconSvg}</div>`;
  const iconCircleHtml = `<div style="display: inline-flex; align-items: center; justify-content: center; width: 32px; height: 32px; background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 50%; color: #475569; flex-shrink: 0;">${iconSvg}</div>`;

  let headerHtml = '';
  let titleHtml = '';

  if (placement === 'LEFT_OF_BRAND') {
    headerHtml = `
      <div style="display: flex; align-items: center; justify-content: center; gap: 15px;">
        ${iconCircleHtml}
        <h1 style="margin: 0; font-family: -apple-system, sans-serif; font-size: 26px; font-weight: 700; letter-spacing: 2px; color: #111827; text-transform: uppercase;">
          Zenora Dental
        </h1>
      </div>
      <div style="margin: 25px auto 30px auto; width: 40px; height: 1px; background-color: #E5E7EB;"></div>
    `;
    titleHtml = `<h2 style="margin: 0 0 25px 0; font-size: 18px; font-weight: 500; color: #374151;">${title}</h2>`;
  } else if (placement === 'LEFT_OF_TITLE') {
    headerHtml = `
      <h1 style="margin: 0; font-family: -apple-system, sans-serif; font-size: 30px; font-weight: 700; letter-spacing: 4px; color: #111827; text-transform: uppercase;">
        Zenora Dental
      </h1>
      <div style="margin: 25px auto 30px auto; width: 40px; height: 1px; background-color: #E5E7EB;"></div>
    `;
    titleHtml = `
      <div style="display: flex; align-items: center; justify-content: center; gap: 10px; margin-bottom: 25px;">
        ${iconCircleHtml}
        <h2 style="margin: 0; font-size: 18px; font-weight: 500; color: #374151;">${title}</h2>
      </div>
    `;
  } else if (placement === 'TOP_LEFT_CORNER') {
    headerHtml = `
      <div style="text-align: left; margin-bottom: -10px;">
        ${iconCircleHtml}
      </div>
      <h1 style="margin: 0; font-family: -apple-system, sans-serif; font-size: 30px; font-weight: 700; letter-spacing: 4px; color: #111827; text-transform: uppercase; text-align: center;">
        Zenora Dental
      </h1>
      <div style="margin: 25px auto 30px auto; width: 40px; height: 1px; background-color: #E5E7EB;"></div>
    `;
    titleHtml = `<h2 style="margin: 0 0 25px 0; font-size: 18px; font-weight: 500; color: #374151; text-align: center;">${title}</h2>`;
  }

  return `
    <!-- Main Email Container -->
    <table width="100%" max-width="600" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #ffffff; overflow: hidden; border: 1px solid #E5E7EB; border-radius: 8px; box-shadow: 0 4px 20px rgba(0,0,0,0.03); margin-bottom: 40px;">
      <tr>
        <td style="padding: 50px 40px 10px 40px; text-align: center;">
          ${headerHtml}
        </td>
      </tr>
      <tr>
        <td style="padding: 10px 50px 40px 50px; text-align: center;">
          ${titleHtml}
          <div style="text-align: left; margin-bottom: 30px;">
            <p style="margin: 0 0 15px 0; font-size: 15px; line-height: 1.8; color: #4B5563; font-weight: 300;">
              Dear <strong style="color: #111827; font-weight: 500;">${patientName}</strong>,
            </p>
            <p style="margin: 0 0 15px 0; font-size: 15px; line-height: 1.8; color: #4B5563; font-weight: 300;">This is a preview to show the icon placement.</p>
          </div>
        </td>
      </tr>
    </table>
  `;
};

const iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" style="width: 100%; height: 100%;"><path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" /></svg>`;

const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, sans-serif; background-color: #F3F4F6; padding: 40px; margin: 0; }
    .container { max-width: 1200px; margin: 0 auto; }
    h1.main-title { text-align: center; color: #111827; margin-bottom: 40px; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; }
    .option { background: white; padding: 20px; border-radius: 12px; }
    .option-title { text-align: center; color: #3B82F6; font-size: 18px; font-weight: 600; margin-bottom: 20px; text-transform: uppercase; letter-spacing: 1px; }
  </style>
</head>
<body>
  <div class="container">
    <h1 class="main-title">Icon Placement Ideas</h1>
    <div class="grid">
      <div class="option">
        <div class="option-title">Idea A: Left of Brand Name</div>
        ${generateIdeaHTML('Appointment Confirmed', 'John Doe', iconSvg, 'LEFT_OF_BRAND')}
      </div>
      <div class="option">
        <div class="option-title">Idea B: Next to the Email Title</div>
        ${generateIdeaHTML('Appointment Confirmed', 'John Doe', iconSvg, 'LEFT_OF_TITLE')}
      </div>
      <div class="option">
        <div class="option-title">Idea C: Top Left Corner</div>
        ${generateIdeaHTML('Appointment Confirmed', 'John Doe', iconSvg, 'TOP_LEFT_CORNER')}
      </div>
    </div>
  </div>
</body>
</html>
`;

fs.writeFileSync('preview-ideas.html', html);
console.log('Successfully generated preview-ideas.html');
