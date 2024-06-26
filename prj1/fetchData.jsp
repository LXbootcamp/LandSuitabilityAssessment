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
String selectedA1 = request.getParameter("selectedA1");
String insertedA20 = request.getParameter("insertedA20");
String inserted_record_slope = request.getParameter("inserted_record_slope");

out.println("selectedA1 : " + selectedA1);
out.println("<br><br>insertedA20 : " + insertedA20);
out.println("<br><br>inserted_record_slope : " + inserted_record_slope);
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
ResultSet rs2 = null;
// ResultSet rs3 = null;

try
{
	// JDBC 읽어오기
	Class.forName("org.postgresql.Driver");
	// DBMS와 연결
	con = DriverManager.getConnection(url, user, pwd);
	// 쿼리 준비
	stmt = con.createStatement();
	// insert 쿼리문
	String query = "update combined_muan set record_slope = '" + inserted_record_slope + "' where pnu ='" + selectedA1+"'";
	out.println("<br><br>query = " + query + "<br><br>");
	// rs = stmt.executeQuery(query);
	int rs = stmt.executeUpdate(query);

	String query2 = "select * from combined_muan where pnu = '" + selectedA1+"'";
	out.println("<br><br>query3 = " + query2 + "<br><br>");
	rs2 = stmt.executeQuery(query2);

	if (rs2.next()) {
		
		String record_slope = rs2.getString("record_slope"); record_slope = checkNull(record_slope);
        out.println("<br><br>record_slope = " +record_slope);
    } 
	rs2.close();
	stmt.close();	
	con.close();
}
catch(Exception ex)		// 위 try{} 에서 문제가 발생하면 이 안으로 들어온다.
{
	// 에러 내용을 보여준다.
	out.println("err: " + ex.toString());
}

%>
</body>
</html>