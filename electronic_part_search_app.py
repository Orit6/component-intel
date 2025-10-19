import streamlit as st

st.title('חיפוש רכיב אלקטרוני לפי מק"ט')

mpn = st.text_input('הכנס מק"ט של רכיב אלקטרוני')

if mpn:
    search_url = f"https://www.oemsecrets.com/search?q={mpn}"
    st.markdown(f"[לחץ כאן לצפייה בתוצאות עבור {mpn}]({search_url})")
    st.info('בלחיצה על הקישור תוכל לראות את סטטוס הרכיב, זמינות אצל מפיצים, מחירים ותחליפים אם קיימים.')
else:
    st.warning('אנא הזן מק"ט כדי להתחיל בחיפוש.')
