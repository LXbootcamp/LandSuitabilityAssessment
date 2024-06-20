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

out.println("selectedA1 : " + selectedA1);
out.println("<br><br>insertedA20 : " + insertedA20);
%>

<%
request.setCharacterEncoding("UTF-8");
response.setContentType("text/html; charset=UTF-8");
//category 파라미터 값 가져오기
String url = "jdbc:postgresql://172.30.0.7/camp";
String user = "scott";
String pwd = "tiger";
Connection con = null;
Statement stmt = null;
ResultSet rs = null;
ResultSet rs3 = null;
String a20_2 = "";

try
{
	// JDBC 읽어오기
	Class.forName("org.postgresql.Driver");
	// DBMS와 연결
	con = DriverManager.getConnection(url, user, pwd);
	// 쿼리 준비
	stmt = con.createStatement();
	// insert 쿼리문
	String query = "select * from muan_all2 where a1 ='" + selectedA1 +"'";
	out.println("<br><br>query = " + query + "<br><br>");
	rs = stmt.executeQuery(query);

	// while (rs.next()) // selectedA1가 primary key 이므로 if가 적합
	if (rs.next()) {
		String a1 = rs.getString("a1"); a1 = checkNull(a1);
		String a2 = rs.getString("a2"); a2 = checkNull(a2);
		String a3 = rs.getString("a3"); a3 = checkNull(a3);
		String a4 = rs.getString("a4"); a4 = checkNull(a4);
		String a5 = rs.getString("a5"); a5 = checkNull(a5);
		String a6 = rs.getString("a6"); a6 = checkNull(a6);
		String a7 = rs.getString("a7"); a7 = checkNull(a7);
		String a8 = rs.getString("a8"); a8 = checkNull(a8);
		String a9 = rs.getString("a9"); a9 = checkNull(a9);
		String a10 = rs.getString("a10"); a10 = checkNull(a10);
		String a11 = rs.getString("a11"); a11 = checkNull(a11);
		String a12 = rs.getString("a12"); a12 = checkNull(a12);
		String a13 = rs.getString("a13"); a13 = checkNull(a13);
        String a14 = rs.getString("a14"); a14 = checkNull(a14);
		String a20 = rs.getString("a20"); a20 = checkNull(a20);
        out.println("<br><br>a20 = " +a20);

		String query2 = "update muan_all2 set a20 = '" + insertedA20 + "' where a1 = '" + selectedA1 + "'";
		out.println("<br><br>query2 = " +query2);
		int rs2 = stmt.executeUpdate(query2);
		
		String query3 = "select * from muan_all2 where a1 ='" + selectedA1 +"'";
		out.println("<br><br>query3 = " + query3 + "<br><br>");
		rs3 = stmt.executeQuery(query3);
		if (rs3.next()) {
			a20_2 = rs3.getString("a20"); a20_2 = checkNull(a20_2);
			out.println("<br><br>a20_2 = " +a20_2);

		}
		rs3.close();
    } 
	rs.close();
	stmt.close();	
	con.close();
}
catch(Exception ex)		// 위 try{} 에서 문제가 발생하면 이 안으로 들어온다.
{
	// 에러 내용을 보여준다.
	out.println("err: " + ex.toString());
}
%>
<script type="text/javascript">
  const a20 = "<%= a20_2 %>";
  console.log("a20 from JSP:", a20);
  // 이후 main.js에서 a20 변수를 사용할 수 있습니다.
</script>

</body>
</html>
