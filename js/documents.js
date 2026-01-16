document.addEventListener('DOMContentLoaded', () => {
    
    const docForm = document.getElementById('documents-form');
    const errorMsg = document.getElementById('form-error');
    const submitBtn = document.getElementById('submit-btn');
    const loader = submitBtn.querySelector('.loader');
    const successModal = document.getElementById('success-modal');
    const modalCloseBtn = document.getElementById('modal-close-btn');
    const btnFinish = document.getElementById('btn-finish');

    if (!docForm) return;

    docForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // 1. UI Loading State
        errorMsg.classList.add('hidden');
        loader.classList.remove('hidden');
        submitBtn.disabled = true;

        try {
            // 2. Recolectar datos
            const name = document.getElementById('user-name').value.trim();
            const lastname = document.getElementById('user-lastname').value.trim();
            const dob = document.getElementById('user-dob').value;
            const phone = document.getElementById('user-phone').value.trim();
            const email = document.getElementById('user-email').value.trim();
            
            const fileAgreement = document.getElementById('file-agreement').files[0];
            const fileAnnex = document.getElementById('file-annex').files[0];

            // Validaciones básicas
            if (!name || !lastname || !dob || !phone || !email || !fileAgreement || !fileAnnex) {
                throw new Error("Please fill in all fields and select both files.");
            }

            // 3. Generar nombres de archivo únicos
            const timestamp = Date.now();
            const cleanName = `${name}_${lastname}`.replace(/\s+/g, '_').toLowerCase();
            
            const agreementPath = `agreement_${cleanName}_${timestamp}.${fileAgreement.name.split('.').pop()}`;
            const annexPath = `annex_${cleanName}_${timestamp}.${fileAnnex.name.split('.').pop()}`;

            // 4. Subir Archivo 1 (Agreement)
            const { error: uploadError1 } = await supabase.storage
                .from('signed-documents') // Asegúrate de crear este bucket
                .upload(agreementPath, fileAgreement);

            if (uploadError1) throw new Error(`Error uploading Agreement: ${uploadError1.message}`);

            // 5. Subir Archivo 2 (Annex)
            const { error: uploadError2 } = await supabase.storage
                .from('signed-documents')
                .upload(annexPath, fileAnnex);

            if (uploadError2) throw new Error(`Error uploading Annex: ${uploadError2.message}`);

            // 6. Guardar datos en la Base de Datos
            const { error: dbError } = await supabase
                .from('signers') // Asegúrate de crear esta tabla
                .insert({
                    first_name: name,
                    last_name: lastname,
                    dob: dob,
                    email: email,
                    phone: phone,
                    agreement_path: agreementPath,
                    annex_path: annexPath
                });

            if (dbError) throw dbError;

            // 7. Éxito
            successModal.classList.remove('hidden');
            docForm.reset();

        } catch (error) {
            console.error(error);
            let message = error.message;
            
            // Manejo de duplicados
            if (error.code === '23505') {
                if (error.message.includes('email')) {
                    message = "This email has already submitted documents.";
                } else if (error.message.includes('phone')) {
                    message = "This phone number has already submitted documents.";
                }
            }
            
            errorMsg.textContent = message;
            errorMsg.classList.remove('hidden');

        } finally {
            loader.classList.add('hidden');
            submitBtn.disabled = false;
        }
    });

    // Cerrar Modal
    const closeModal = () => {
        successModal.classList.add('hidden');
        window.scrollTo(0, 0);
    };

    if(modalCloseBtn) modalCloseBtn.addEventListener('click', closeModal);
    if(btnFinish) btnFinish.addEventListener('click', closeModal);

});