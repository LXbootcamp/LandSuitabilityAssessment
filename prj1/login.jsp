<%@ page language="java" contentType="text/html; charset=UTF-8"
    pageEncoding="UTF-8" import="java.sql.*"%>
<%@ page import="java.security.MessageDigest" %>
<%@ page import="java.math.BigInteger" %>
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>로그인 처리</title>
    <script type="text/javascript">
        function showAlert(message) {
            alert(message);
            history.back(); // 로그인 페이지로 되돌아가기
        }
    </script>
</head>
<body>
    <h2>로그인 결과</h2>
    <%
        // Get the form data
        String username = request.getParameter("username");
        String password = request.getParameter("password");
        request.setCharacterEncoding("UTF-8");
        response.setContentType("text/html; charset=UTF-8");
        
        // Hash the password using SHA-256
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
    
    //category 파라미터 값 가져오기
    String url = "jdbc:postgresql://172.30.0.7/boot";
    String user = "scott";
    String pwd = "tiger";
    Connection con = null;
    Statement stmt = null;
    ResultSet rs = null;
    

    

    try{
        // JDBC 읽어오기
	    Class.forName("org.postgresql.Driver");
	    // DBMS와 연결
	    con = DriverManager.getConnection(url, user, pwd);
	    // 쿼리 준비
	    stmt = con.createStatement();    
        String query = "select * from profile where username = '" + username + "' and password = '" + hashedPassword + "'";
        out.print("<br><br>query = " + query + "<br><br>");
        
        rs = stmt.executeQuery(query);

        if (rs.next()) {
            // HttpSession session = request.getSession(false);
            session.setAttribute("username", username);
            response.sendRedirect("index.html");
        } else {
            out.println("<script>showAlert('로그인에 실패했습니다. 사용자 이름과 비밀번호를 확인하세요.');</script>");

        }
    
        stmt.close();
        con.close();

    
    }catch(Exception ex)		// 위 try{} 에서 문제가 발생하면 이 안으로 들어온다.
    {
	// 에러 내용을 보여준다.
	out.print("err: " + ex.toString());
    }   

    %>
</body>
</html>
