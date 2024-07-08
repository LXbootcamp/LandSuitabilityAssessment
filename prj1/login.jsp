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
        rs = stmt.executeQuery(query);

        if (rs.next()) {
            String index = rs.getString("index");
            String name = rs.getString("name");
            // HttpSession session = request.getSession();
            session.setAttribute("name", name);
            session.setAttribute("loggedIn", true);
            
            if (index.equals("0")) { // 인덱스가 0이면 로그인 불가... 관리자가 1로 바꿔줘야 함
                out.println("<script>showAlert('관리자의 승인이 필요합니다.');</script>");
            } else {
                // session.setAttribute("name", name);
                response.sendRedirect("index.html");
            }
        } else {
            out.println("<script>showAlert('아이디 또는 비밀번호가 일치하지 않습니다.');</script>");
        }
        stmt.close();
        con.close();
    }catch(Exception ex)
    {
	// 에러 내용을 보여준다.
	out.print("err: " + ex.toString());
    }   

    %>
</body>
</html>
