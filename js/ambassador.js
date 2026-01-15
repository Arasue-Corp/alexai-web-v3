// Función para no distorsionar imágenes en el PDF
function getImageProperties(base64) {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = function() {
            resolve({ width: this.width, height: this.height, ratio: this.width / this.height });
        };
        img.src = base64;
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const registrationForm = document.getElementById('registration-form');
    if (!registrationForm) return;

    // Respuestas del Quiz
    const correctAnswers = { q1: 'C', q2: 'B', q3: 'B', q4: 'B', q5: 'B' };

    // Elementos UI
    const btnStep1Next = document.getElementById('btn-step1-next');
    const btnStep2Next = document.getElementById('btn-step2-next');
    const quizSubmitBtn = document.getElementById('quiz-submit-btn');
    const successModal = document.getElementById('success-modal');
    const modalCloseBtn = document.getElementById('modal-close-btn');

    let userData = {};

    function showStep(stepNum) {
        document.querySelectorAll('.form-step-panel').forEach(p => p.classList.remove('active'));
        document.getElementById(`step-${stepNum}`).classList.add('active');
        document.getElementById('ambassadorProgress').style.width = `${(stepNum / 4) * 100}%`;
        document.getElementById('currentStepNum').textContent = stepNum;
        window.scrollTo(0, 0);
    }

    // Navegación Básica
    btnStep1Next.addEventListener('click', () => {
        const name = document.getElementById('user-name').value;
        const lastname = document.getElementById('user-lastname').value;
        const email = document.getElementById('user-email').value;
        const phone = document.getElementById('user-phone').value;

        if (!name || !lastname || !email || !phone) {
            alert("Please fill all required fields");
            return;
        }
        userData = { name: `${name} ${lastname}`, email, phone };
        showStep(2);
    });

    btnStep2Next.addEventListener('click', () => showStep(3));
    document.getElementById('btn-step2-back').addEventListener('click', () => showStep(1));
    document.getElementById('btn-step3-back').addEventListener('click', () => showStep(2));

    // Lógica del PDF y Envío
    registrationForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(registrationForm);
        let allCorrect = true;
        for (const [q, ans] of Object.entries(correctAnswers)) {
            if (formData.get(q) !== ans) { allCorrect = false; break; }
        }

        if (!allCorrect) {
            document.getElementById('quiz-error').textContent = "100% accuracy required. Please review.";
            document.getElementById('quiz-error').classList.remove('hidden');
            return;
        }

        quizSubmitBtn.disabled = true;
        
        try {
            // 1. Guardar en Supabase
            const { error } = await supabase.from('ambassadors').insert([{ 
                name: userData.name, email: userData.email, phone: userData.phone, quiz_passed: true 
            }]);
            if (error) throw error;

            // 2. Generar PDF
            await generateAmbassadorPDF(userData.name);

            // 3. Éxito
            successModal.classList.remove('hidden');
        } catch (err) {
            console.error(err);
            alert("Error saving data.");
        } finally {
            quizSubmitBtn.disabled = false;
        }
    });

    modalCloseBtn.addEventListener('click', () => {
        successModal.classList.add('hidden');
        document.getElementById('user-name-final').textContent = userData.name.split(' ')[0];
        showStep(4);
    });

    async function generateAmbassadorPDF(fullName) {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF('l', 'mm', 'a4');
        const pageWidth = 297;
        const pageHeight = 210;

        // Assets (Reemplazar con tus Base64 reales)
        const logo = "data:image/png;base64,..."; 
        
        // Estética del Certificado
        doc.setFillColor(74, 128, 240); // Azul Alex AI
        doc.rect(0, 0, pageWidth, 15, 'F');
        
        doc.setFont("helvetica", "bold");
        doc.setFontSize(40);
        doc.setTextColor(44, 62, 80);
        doc.text("AMBASSADOR CERTIFICATE", pageWidth / 2, 60, { align: 'center' });
        
        doc.setFontSize(20);
        doc.setFont("helvetica", "normal");
        doc.text("This certifies that", pageWidth / 2, 85, { align: 'center' });
        
        doc.setFontSize(35);
        doc.setTextColor(74, 128, 240);
        doc.text(fullName.toUpperCase(), pageWidth / 2, 110, { align: 'center' });
        
        doc.setFontSize(16);
        doc.setTextColor(100, 116, 139);
        doc.text("Has successfully completed the Alex AI knowledge quiz.", pageWidth / 2, 130, { align: 'center' });

        doc.save(`Ambassador_${fullName.replace(/ /g, '_')}.pdf`);
    }
});