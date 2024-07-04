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
String area = request.getParameter("area");
String round = request.getParameter("round");
String developValue = request.getParameter("developValue");
String conserveValue = request.getParameter("conserveValue");
String compreValue = request.getParameter("compreValue");
String geom = request.getParameter("geom");
String slope_poly = request.getParameter("slope_poly");
String height_poly = request.getParameter("height_poly");
String dist_gi_str_poly = request.getParameter("dist_gi_str_poly");
String dist_gong_ntwk_poly = request.getParameter("dist_gong_ntwk_poly");
String rate_city_poly = request.getParameter("rate_city_poly");
String rate_city_touch_poly = request.getParameter("rate_city_touch_poly");
String dist_road_touch_poly = request.getParameter("dist_road_touch_poly");
String rate_kyungji_poly = request.getParameter("rate_kyungji_poly");
String rate_saengtae_poly = request.getParameter("rate_saengtae_poly");
String rate_gongjuck_poly = request.getParameter("rate_gongjuck_poly");
String dist_gongjuck_poly = request.getParameter("dist_gongjuck_poly");
String rate_jdgarea_poly = request.getParameter("rate_jdgarea_poly");
String rate_nongup_poly = request.getParameter("rate_nongup_poly");
String rate_limsangdo_poly = request.getParameter("rate_limsangdo_poly");
String rate_bojunmount_poly = request.getParameter("rate_bojunmount_poly");
String dist_kyungji_poly = request.getParameter("dist_kyungji_poly");
out.print("dist_kyungji_poly: " + dist_kyungji_poly);
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
        String query = "insert into polygon_data (area, round, develop_value, conserve_value, value_comp, geom, slope_poly, height_poly, dist_gi_str_poly, dist_gong_ntwk_poly, rate_city_poly, rate_city_touch_poly, dist_road_touch_poly, rate_kyungji_poly, rate_saengtae_poly, rate_gongjuck_poly, dist_gongjuck_poly, rate_jdgarea_poly, rate_nongup_poly, rate_limsangdo_poly, rate_bojunmount_poly, dist_kyungji_poly) values ('"+ area +"', '"+ round +"', '"+ developValue +"', '"+ conserveValue +"', '"+ compreValue +"', '"+ geom +"', '"+ slope_poly +"', '"+ height_poly +"', '"+ dist_gi_str_poly +"', '"+ dist_gong_ntwk_poly +"', '"+ rate_city_poly +"', '"+ rate_city_touch_poly +"', '"+ dist_road_touch_poly +"', '"+ rate_kyungji_poly +"', '"+ rate_saengtae_poly +"', '"+ rate_gongjuck_poly +"', '"+ dist_gongjuck_poly +"', '"+ rate_jdgarea_poly +"', '"+ rate_nongup_poly +"', '"+ rate_limsangdo_poly +"', '"+ rate_bojunmount_poly +"', '"+ dist_kyungji_poly +"');";
        out.print("<br><br>query = " + query + "<br><br>");
        int rs = stmt.executeUpdate(query);
    } else if ("2".equals(index)) {
        // update 쿼리문
        String query = "update polygon_data set round = '"+ round +
        "', develop_value = '"+ developValue +
        "', conserve_value = '"+ conserveValue +
        "', value_comp = '"+ compreValue +
        "', geom = '"+ geom +
        "', slope_poly = '"+ slope_poly +
        "', height_poly = '"+ height_poly +
        "', dist_gi_str_poly = '"+ dist_gi_str_poly +
        "', dist_gong_ntwk_poly = '"+ dist_gong_ntwk_poly +
        "', rate_city_poly = '"+ rate_city_poly +
        "', rate_city_touch_poly = '"+ rate_city_touch_poly +
        "', dist_road_touch_poly = '"+ dist_road_touch_poly +
        "', rate_kyungji_poly = '"+ rate_kyungji_poly +
        "', rate_saengtae_poly = '"+ rate_saengtae_poly +
        "', rate_gongjuck_poly = '"+ rate_gongjuck_poly +
        "', dist_gongjuck_poly = '"+ dist_gongjuck_poly +
        "', rate_jdgarea_poly = '"+ rate_jdgarea_poly +
        "', rate_nongup_poly = '"+ rate_nongup_poly +
        "', rate_limsangdo_poly = '"+ rate_limsangdo_poly +
        "', rate_bojunmount_poly = '"+ rate_bojunmount_poly +
        "', dist_kyungji_poly = '"+ dist_kyungji_poly +
        "' where area = '"+ area +"';";
        out.print("<br><br>query = " + query + "<br><br>");
        int rs = stmt.executeUpdate(query);
    } else if ("3".equals(index)) {
        // delete 쿼리문
        String query = "delete from polygon_data where area = '"+ area +"';";
        out.print("<br><br>query = " + query + "<br><br>");
        int rs = stmt.executeUpdate(query);
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