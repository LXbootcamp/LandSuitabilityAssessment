<%@ page contentType="text/plain; charset=UTF-8" %>
<%@ page import="javax.servlet.http.*, javax.servlet.*" %>
<%
    // HttpSession session = request.getSession(false);
    if (session != null && session.getAttribute("username") != null) {
        out.print("loggedIn");
    } else {
        out.print("notLoggedIn");
    }
%>
