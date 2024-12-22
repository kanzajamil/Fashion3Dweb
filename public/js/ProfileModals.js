// Ensure the DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Handle the modal show event
    $('#editModal').on('show.bs.modal', function (event) {
        var button = $(event.relatedTarget); // Button that triggered the modal
        var currentName = button.data('name'); // Extract name from data-* attributes
        var modal = $(this);
        console.log("hiii");
        modal.find('#userName').val(currentName); // Set the current name in the input
    });

    // Handle Save button click
    $('#saveNameButton').on('click', function() {
        // Get the updated name
        var updatedName = $('#userName').val();
        
        console.log("Sending AJAX request to update name...");
        $.ajax({
            type: "POST",
            url: "/update-name", // Update this URL to your backend
            data: { name: updatedName },
            success: function(response) {
                console.log("Name updated successfully:", response);
                $('#editModal').modal('hide'); 
                location.reload(); // Close the modal on success
            },
            error: function(err) {
                console.error("Error updating name:", err);
            }
        });
    });

    $('#editEmailModal').on('show.bs.modal', function () {
        $.ajax({
            type: "POST",
            url: "/send-otp",
            success: function(response) {
                console.log("OTP sent Successfully.")
            },
            error: function(err) {
                console.error("Error sending OTP:", err);
                alert("Failed to send OTP. Please try again.");
            }
        });
    });

    // Verify OTP
    $('#verifyOtpButton').on('click', function() {
        const otp = $('#otp').val();
        
        $.ajax({
            type: "POST",
            url: "/verify-otp",
            data: { otp: otp },
            success: function(response) {
                alert("OTP verified successfully.");
                $('#otpVerificationForm').hide(); // Hide OTP input
                $('#verifyOtpButton').hide(); // Hide OTP verify button
                $('#emailUpdateForm').show(); // Show new email input
                $('#saveEmailButton').show(); // Show save new email button
            },
            error: function(err) {
                console.error("OTP verification failed:", err);
                alert("Invalid OTP. Please try again.");
            }
        });
    });

    // Save new email
    $('#saveEmailButton').on('click', function() {
        const newEmail = $('#newEmail').val();
        
        $.ajax({
            type: "POST",
            url: "/update-email",
            data: { newEmail: newEmail },
            success: function(response) {
                
                $('#editEmailModal').modal('hide');
                location.reload(); // Close the modal
            },
            error: function(err) {
                console.error("Error updating email:", err);
                alert("Failed to update email. Please try again.");
            }
        });
    });
    $('#verifyPassButton').on('click', function() {
        const currentPassword = $('#pass').val();

        $.ajax({
            type: "POST",
            url: "/verify-password",
            data: { currentPassword: currentPassword },
            success: function(response) {
                alert("Current password verified.");
                
                // Hide the current password form, show new password form
                $('#passwordverifyForm').hide();
                $('#verifyPassButton').hide();
                $('#passwordUpdateForm').show();
                $('#savePassButton').show();
            },
            error: function(err) {
                console.error("Password verification failed:", err);
                alert("Incorrect current password. Please try again.");
            }
        });
    });

    // Handle Save New Password button click
    $('#savePassButton').on('click', function() {
        const newPassword = $('#newPassword').val();

        $.ajax({
            type: "POST",
            url: "/update-password",
            data: { newPassword: newPassword },
            success: function(response) {
                alert("Password updated successfully.");
                $('#editPasswordModal').modal('hide'); // Close the modal on success
                window.location.href = "/settings";
            },
            error: function(err) {
                console.error("Error updating password:", err);
                alert("Failed to update password. Please try again.");
            }
        });
    });
    $('#confirmDeleteButton').on('click', function() {
        $.ajax({
            type: 'POST',
            url: '/delete-account', // Backend route for deleting account
            success: function(response) {
                
                window.location.href = "/signup"; // Redirect to signup page
            },
            error: function(error) {
                console.error("Error deleting account:", error);
                alert("Failed to delete account. Please try again.");
            }
        });
    });
});
