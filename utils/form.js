const passForm = (activationCode) => {
  return `<!DOCTYPE html><html lang="en"> <head> <meta charset="utf-8" /> <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" /> <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.1/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-+0n0xVW2eSR5OomGNYDnhzAbDsOXxcvSN1TPprVMTNDbiYZCxYbOOl7+AMvyTG2x" crossorigin="anonymous" /> <style> /* Set entire page to full width and full height */ html, body { height: 100% !important; width: 100% !important; } /* Media query for mobile responsive */ @media screen and (min-width: 576px) { .card { height: 75% !important; width: 75% !important; } } /* Media query for tablet/iPad responsive */ @media (min-width: 768px) { .card { height: 50% !important; width: 75% !important; } } /* Media query for desktop/laptop responsive */ @media (min-width: 992px) { .card { height: 60% !important; width: 50% !important; } } </style> </head> <body> <div class="alert alert-warning" role="alert" id="alertBox" style="position: fixed; right: 0; left: 0; display: none; z-index: 5" > <strong>Invalid Password</strong> You should consider the instructions below. </div> <div style="background-color: #ff9149" class=" container-md w-100 h-100 d-flex justify-content-center align-items-center " > <div class="card shadow-sm h-100 w-100"> <!-- Card header --> <div class="card-header p-3 text-center" style="background-color: #ffd7b4" > <span class="h4">Reset your password</span> </div> <div class="d-flex justify-content-center my-3"> <ul> <li>At least 8 characters</li> <li>Inclusion of at least one uppercase</li> <li> Inclusion of at least one special character, e.g., ! @ # ? ] </li> <li>Inclusion of at least one number</li> </ul> </div> <div class=" card-body stylish-color d-flex justify-content-center align-items-center " style="" > <form class="w-100"> <!-- Username Input field --> <div class="row align-items-center my-3"> <label for="password" class="col-sm-4 col-form-label" >New Password</label > <div class="col-sm-8"> <div> <input type="password" class="form-control" id="password" placeholder="New password" /> </div> </div> </div> <!-- confirmPassword Input field --> <div class="row align-items-center my-3"> <label for="confirmPassword" class="col-sm-4 col-form-label" >Confirm Password</label > <div class="col-sm-8"> <div> <input type="password" class="form-control" id="confirmPassword" placeholder="Retype Password" /> </div> </div> </div> <!-- Submit button --> <div class="text-center"> <button class="btn" style="background-color: #feb38b" id="submit"> Submit </button> </div> </form> </div> </div> </div> <script src="https://code.jquery.com/jquery-3.6.0.min.js" integrity="sha256-/xUj+3OJU5yExlq6GSYGSHk7tPXikynS7ogEvDej/m4=" crossorigin="anonymous" ></script> <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.0.1/dist/js/bootstrap.bundle.min.js" integrity="sha384-gtEjrD/SeCtmISkJkNUaaKMoLD0//ElJ19smozuHV6z3Iehds+3Ulb9Bn9Plx0x4" crossorigin="anonymous" ></script> <script> $(document).ready(function () { const url_string = window.location.href; const url = new URL(url_string); const activationCode = url.searchParams.get("activation-code"); ("use strict"); $("#submit").click((e) => { e.preventDefault(); const p1 = $("#password").val(); const p2 = $("#confirmPassword").val(); let matchp1 = p1.match( "^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}" ); let matchp2 = p2.match( "^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}" ); if (p1 === p2) { if (matchp1 !== null && matchp2 !== null) { fetch( "http://localhost:8000/account/reset-password/" + activationCode, { method: "POST", body: JSON.stringify({ NewPassword: p1, ConfirmPassword: p2, }), headers: { "Content-type": "application/json; charset=UTF-8", }, } ) .then((response) => { if (response.status == 408) { alert("No reset request found or request timedout"); } else { alert("Password Changed"); window.location.replace("http://localhost:8000/login"); } }) .catch((err) => console.log(err)); } else { $("#alertBox").show(); setTimeout(() => { $("#alertBox").hide(); }, 3000); console.log("password error"); } } else { $("#alertBox").html( "<strong>Password not match</strong> Recheck the password" ); $("#alertBox").show(); setTimeout(() => { $("#alertBox").html( "<strong>Invalid Password</strong> You should consider the instructions below" ); $("#alertBox").hide(); }, 3000); console.log("password error"); } }); }); </script> </body></html>`;
};

module.exports = passForm;
