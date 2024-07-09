<%@ page language="java" contentType="text/html; charset=UTF-8"
    pageEncoding="UTF-8"%>
<%@ page import="javax.servlet.http.*, javax.servlet.*" %>
<%
    // 세션을 무효화하여 로그아웃 처리
    session = request.getSession(false);
    if (session != null) {
        session.invalidate();
    }
    
    // 로그아웃 후 로그인 페이지로 리다이렉트
    response.sendRedirect("../login.html");
%>
