<%@ page language="java" contentType="text/html; charset=UTF-8"
    pageEncoding="UTF-8" import="java.sql.*"%>
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>무안군 토지적성 평가 프로그램 DB 페이지</title>
 </head>
<body>

<%!
String checkNull(String data){
	if (data == null){
		return "";
	}
	else{
		return data;
	}
}
%>

<%
// 파라미터 값 가져오기
String index = request.getParameter("index"); // 1 : insert, 2 : update, 3 : delete
out.println("index : " + index); 
String area = request.getParameter("area");
out.println("area : " + area);
String round = request.getParameter("round");
out.println("round : " + round);
String developValue = request.getParameter("developValue");
out.println("developValue : " + developValue);
String conserveValue = request.getParameter("conserveValue");
out.println("conserveValue : " + conserveValue);
String compreValue = request.getParameter("compreValue");
out.println("compreValue : " + compreValue);
String geom = request.getParameter("geom");
out.println("geom : " + geom);
%>

<%
request.setCharacterEncoding("UTF-8");
response.setContentType("text/html; charset=UTF-8");
//category 파라미터 값 가져오기
String url = "jdbc:postgresql://172.30.0.7/boot";
String user = "scott";
String pwd = "tiger";
Connection con = null;
Statement stmt = null;
// ResultSet rs = null;

try{
    // JDBC 읽어오기
	Class.forName("org.postgresql.Driver");
	// DBMS와 연결
	con = DriverManager.getConnection(url, user, pwd);
	// 쿼리 준비
	stmt = con.createStatement();
    out.print("index: " + index);
    if ("1".equals(index)) {
        
        // insert 쿼리문
        String query = "insert into polygon_data (area, round, develop_value, conserve_value, value_comp, geom) values ('"+ area +"', '"+ round +"', '"+ developValue +"', '"+ conserveValue +"', '"+ compreValue +"', '"+ geom +"');";
        out.print("<br><br>query = " + query + "<br><br>");
        int rs = stmt.executeUpdate(query);
    } else if ("2".equals(index)) {
        // update 쿼리문
        String query = "update polygon_data set develop_value = '"+ developValue +"', conserve_value = '"+ conserveValue +"', value_comp = '"+ compreValue +
        "' where area = '"+ area +"';";
        out.print("<br><br>query = " + query + "<br><br>");
        int rs = stmt.executeUpdate(query);
    } else if ("3".equals(index)) {
        // delete 쿼리문
        String query = "delete from polygon_data where area = '"+ area +"';";
        out.print("<br><br>query = " + query + "<br><br>");
        int rs = stmt.executeUpdate(query);
    }

    // String query = "insert into polygon_data (area, round, develop_value, conserve_value, value_comp, geom) values ('"+ area +"', '"+ round +"', '"+ developValue +"', '"+ conserveValue +"', '"+ compreValue +"', "+ geom +");";
    // out.print("<br><br>query = " + query + "<br><br>");

    // int rs = stmt.executeUpdate(query);


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