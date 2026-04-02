const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

/**
 * Generates an automated PDF slip and saves it to the uploads folder.
 */
const generateDocument = (documentType, parent, requestData, signatureFile) => {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({ margin: 50 });
            
            const generatedDir = path.join('uploads', 'generated_documents');
            if (!fs.existsSync(generatedDir)) {
                fs.mkdirSync(generatedDir, { recursive: true });
            }

            const fileName = `REQ-${Date.now()}-${requestData.student_bemis_id || 'SLIP'}.pdf`;
            const filePath = path.join(generatedDir, fileName);
            const stream = fs.createWriteStream(filePath);

            doc.pipe(stream);

            doc.fontSize(20).text('Bishop Martin High School', { align: 'center' });
            doc.moveDown();
            doc.fontSize(16).text(documentType.name.replace('_', ' ').toUpperCase(), { align: 'center', underline: true });
            doc.moveDown(2);

            doc.fontSize(12);
            doc.text(`Date of Request: ${new Date().toLocaleDateString()}`);
            doc.text(`Student Name: ${requestData.student_full_name}`);
            doc.text(`BEMIS ID: ${requestData.student_bemis_id || 'N/A'}`);
            doc.text(`Graduation Year/Years Attended: ${requestData.student_graduation_year_or_years_attended || 'N/A'}`);
            doc.moveDown();

            let formDataObj = {};
            if (typeof requestData.form_data === 'string') {
                try { formDataObj = JSON.parse(requestData.form_data); } catch(e){}
            } else if (typeof requestData.form_data === 'object'){
                formDataObj = requestData.form_data;
            }

            if (Object.keys(formDataObj).length > 0) {
                doc.text('--- Additional Details ---', { underline: true });
                for (const [key, value] of Object.entries(formDataObj)) {
                    const formattedKey = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                    doc.text(`${formattedKey}: ${value}`);
                }
                doc.moveDown();
            }

            doc.moveDown(4);
            doc.text('_____________________________', { align: 'left' });
            doc.text(`Parent/Guardian: ${parent.full_name}`, { align: 'left' });

            if (signatureFile) {
                doc.image(signatureFile.path, 50, doc.y - 70, { fit: [200, 50], align: 'left', valign: 'bottom' });
            }

            doc.end();

            stream.on('finish', () => {
                resolve(`uploads/generated_documents/${fileName}`);
            });
            stream.on('error', (err) => reject(err));

        } catch (error) {
            reject(error);
        }
    });
};

module.exports = { generateDocument };
