<%@ page language="java" contentType="text/html; charset=UTF-8"
    pageEncoding="UTF-8"%>
<%@ page import="javax.servlet.http.*, javax.servlet.*" %>
<%
    String name = (String) session.getAttribute("name");
    session = request.getSession(false);
    if (session != null && session.getAttribute("loggedIn") != null) {
        out.print(name);
    } else {
        out.print("notLoggedIn");
    }
%>