/*$(document).ready(function() {
    $("#commentForm").validate({
      rules: {
       
        "Full name": {
          required: true,
        },
        "Email address": {
          required: true,
          email: true,
        },
        "Password": {
          required: true,
          minlength: 6,
        },
        "signupCheck": {
          required: true,
        },
      },
      messages: {
      
        "Full name": {
          required: "Full name is required.",
        },
        "Email address": {
          required: "Email address is required.",
          email: "Please enter a valid email address.",
        },
        "Password": {
          required: "Password is required.",
          minlength: "Password must be at least 6 characters long.",
        },
        "signupCheck": {
          required: "You must accept the terms & conditions.",
        },
      },
      errorElement: "span", 
      errorPlacement: function(error, element) {
        
        error.insertAfter(element);
        
      },
    });

    $("#loginForm").validate({
      rules: {
        "Email address": {
          required: true,
          email: true,
        },
        "Password": {
          required: true,
          minlength: 6,
        },
      },
      messages: {
        "Email address": {
          required: "Email address is required.",
          email: "Please enter a valid email address.",
        },
        "Password": {
          required: "Password is required.",
          minlength: "Password must be at least 6 characters long.",
        },
      },
      errorElement: "span", 
      errorPlacement: function(error, element) {
        
        error.insertAfter(element);
      },
    });
  });
  */