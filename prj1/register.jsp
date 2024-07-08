<%@ page language="java" contentType="text/html; charset=UTF-8"
    pageEncoding="UTF-8" import="java.sql.*"%>
<%@ page import="java.security.MessageDigest" %>
<%@ page import="java.math.BigInteger" %>
<!DOCTYPE html>
<html>
<%
    request.setCharacterEncoding("UTF-8");
    response.setContentType("text/html; charset=UTF-8");
%>
<head>
    <meta charset="UTF-8">
    <title>회원가입 처리</title>
     <script type="text/javascript">
        function showAlert(message, isSuccess) {
            alert(message);
            if(isSuccess) {
                history.back();
                location.href = "login.html";
            } else {
                history.back();
            }
            
        }
    </script>
</head>
<body>
    <h2>회원가입 결과</h2>
    <%
        // Get the form data
        String username = request.getParameter("username");
        String password = request.getParameter("password");
        String phone = request.getParameter("phone");
        String name = request.getParameter("name");
        out.print("<br><br>name = " + name + "<br><br>");

        
        // SHA-256을 사용한 비밀번호 해싱
        String hashedPassword = null;
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            md.update(password.getBytes("UTF-8"));
            byte[] digest = md.digest();
            hashedPassword = String.format("%064x", new BigInteger(1, digest));
        } catch (Exception e) {
            e.printStackTrace();
        }
    %>
    <%
    String url = "jdbc:postgresql://172.30.0.7/boot";
    String user = "scott";
    String pwd = "tiger";
    Connection con = null;
    Statement stmt = null;
    try{
        // JDBC 읽어오기
	    Class.forName("org.postgresql.Driver");
	    // DBMS와 연결
	    con = DriverManager.getConnection(url, user, pwd);
	    // 쿼리 준비
	    stmt = con.createStatement();    
        // insert 쿼리문
        String query = "insert into profile (username, password, name, phone, index) values ('" + 
        username + "', '" + hashedPassword + "', '" + name + "', '" + phone +"', '0')";
        out.print("<br><br>query = " + query + "<br><br>");
        int rs = stmt.executeUpdate(query);
    
        stmt.close();
        con.close();
        out.println("<script>showAlert('회원가입 성공');</script>");
    }catch(Exception ex)
    {
	// 에러 내용을 보여준다.
	out.println("<script>showAlert('회원가입 실패. 다시 시도해주세요.');</script>");
    }   
    %>

</body>
</html>
