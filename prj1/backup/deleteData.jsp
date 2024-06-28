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
String selected_pnu = request.getParameter("selected_pnu");
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
	String query = "update combined_muan set " +
    "record_slope = "+ 0 + ", " +
    "record_height = "+ 0 + ", " +
    "record_dist_gi_str = "+ 0 + ", " +
    "record_dist_gong_ntwk = "+ 0 + ", " +
    "record_rate_city = "+ 0 + ", " +
    "record_rate_city_1 = "+ 0 + ", " +
    "record_rate_city_touch = "+ 0 + ", " +
    "record_dist_road = "+ 0 + ", " +
    "record_rate_kyungji = "+ 0 + ", " +
    "record_rate_saengtae = "+ 0 + ", " +
    "record_rate_gongjuck = "+ 0 + ", " +
    "record_dist_gongjuck = "+ 0 + ", " +
    "record_rate_jdgarea = "+ 0 + ", " +
    "record_rate_nongup = "+ 0 + ", " +
    "record_rate_limsangdo = "+ 0 + ", " +
    "record_rate_bojunmount = "+ 0 + ", " +
    "record_dist_kyungji = "+ 0 + ", " +
	"value_develop = "+ 0 + ", " +
	"value_conserv = "+ 0 + ", " +
	"value_comp = "+ 0 + " " +
    "where pnu = '" + selected_pnu + "'";

	out.println("<br><br>query = " + query + "<br><br>");
	// rs = stmt.executeQuery(query);
	int rs = stmt.executeUpdate(query);

	String query2 = "select * from combined_muan where pnu = '" + selected_pnu+"'";
	out.println("<br><br>query3 = " + query2 + "<br><br>");
	rs2 = stmt.executeQuery(query2);

	if (rs2.next()) {
		
		String record_slope = rs2.getString("record_slope"); record_slope = checkNull(record_slope);
		String record_height = rs2.getString("record_height"); record_height = checkNull(record_height);
		String record_dist_gi_str = rs2.getString("record_dist_gi_str"); record_dist_gi_str = checkNull(record_dist_gi_str);
		String record_dist_gong_ntwk = rs2.getString("record_dist_gong_ntwk"); record_dist_gong_ntwk = checkNull(record_dist_gong_ntwk);
		String record_rate_city = rs2.getString("record_rate_city"); record_rate_city = checkNull(record_rate_city);
		String record_rate_city_1 = rs2.getString("record_rate_city_1"); record_rate_city_1 = checkNull(record_rate_city_1);
		String record_rate_city_touch = rs2.getString("record_rate_city_touch"); record_rate_city_touch = checkNull(record_rate_city_touch);
		String record_dist_road = rs2.getString("record_dist_road"); record_dist_road = checkNull(record_dist_road);
		String record_rate_kyungji = rs2.getString("record_rate_kyungji"); record_rate_kyungji = checkNull(record_rate_kyungji);
		String record_rate_saengtae = rs2.getString("record_rate_saengtae"); record_rate_saengtae = checkNull(record_rate_saengtae);
		String record_rate_gongjuck = rs2.getString("record_rate_gongjuck"); record_rate_gongjuck = checkNull(record_rate_gongjuck);
		String record_dist_gongjuck = rs2.getString("record_dist_gongjuck"); record_dist_gongjuck = checkNull(record_dist_gongjuck);
		String record_rate_jdgarea = rs2.getString("record_rate_jdgarea"); record_rate_jdgarea = checkNull(record_rate_jdgarea);
		String record_rate_nongup = rs2.getString("record_rate_nongup"); record_rate_nongup = checkNull(record_rate_nongup);
		String record_rate_limsangdo = rs2.getString("record_rate_limsangdo"); record_rate_limsangdo = checkNull(record_rate_limsangdo);
		String record_rate_bojunmount = rs2.getString("record_rate_bojunmount"); record_rate_bojunmount = checkNull(record_rate_bojunmount);
		String record_dist_kyungji = rs2.getString("record_dist_kyungji"); record_dist_kyungji = checkNull(record_dist_kyungji);
		String value_develop = rs2.getString("value_develop"); value_develop = checkNull(value_develop);
		String value_conserv = rs2.getString("value_conserv"); value_conserv = checkNull(value_conserv);
		String value_comp = rs2.getString("value_comp"); value_comp = checkNull(value_comp);
        out.println("<br><br>record_slope = " +record_slope);
		out.println("<br>record_height = " +record_height);
		out.println("<br>record_dist_gi_str = " +record_dist_gi_str);
		out.println("<br>record_dist_gong_ntwk = " +record_dist_gong_ntwk);
		out.println("<br>record_rate_city = " +record_rate_city);
		out.println("<br>record_rate_city_1 = " +record_rate_city_1);
		out.println("<br>record_rate_city_touch = " +record_rate_city_touch);
		out.println("<br>record_dist_road = " +record_dist_road);
		out.println("<br>record_rate_kyungji = " +record_rate_kyungji);
		out.println("<br>record_rate_saengtae = " +record_rate_saengtae);
		out.println("<br>record_rate_gongjuck = " +record_rate_gongjuck);
		out.println("<br>record_dist_gongjuck = " +record_dist_gongjuck);
		out.println("<br>record_rate_jdgarea = " +record_rate_jdgarea);
		out.println("<br>record_rate_nongup = " +record_rate_nongup);
		out.println("<br>record_rate_limsangdo = " +record_rate_limsangdo);
		out.println("<br>record_rate_bojunmount = " +record_rate_bojunmount);
		out.println("<br>record_dist_kyungji = " +record_dist_kyungji);
		out.println("<br>value_develop = " +value_develop);
		out.println("<br>value_conserv = " +value_conserv);
		out.println("<br>value_comp = " +value_comp);
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