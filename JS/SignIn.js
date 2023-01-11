function validate(){
    try {
        username = $("#InputName").val();
        password = $("#InputPassword1").val();
    
        var valid1 = false;
        var valid2 = false;
        if (username == ""){
            $(".nameErr").html("Enter Username");
        } else if (username){
            $(".nameErr").html("");
            var valid1 = true;
        }
    
        if (password == ""){
            $(".passErr").html("Enter Password");
        } else if (password){
            $(".passErr").html("");
            var valid2 = true;
        }
    
        if (valid1 == true && valid2 == true){
            $("form").attr("action", "Dashboard.html")
        } else {
            document.getElementById('error-message').innerHTML = 'Wrong password';
        }
    } catch (error) {
        console.log(error);
    }

}