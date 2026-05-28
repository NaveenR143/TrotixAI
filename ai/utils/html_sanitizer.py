from html.parser import HTMLParser
from urllib.parse import urlparse

class SafeHTMLParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.result = []
        self.allowed_tags = {
            "h1", "h2", "h3", "h4", "h5", "h6",
            "p", "br", "strong", "em", "u",
            "ol", "ul", "li", "a", "span", "div",
            "b", "i"
        }
        self.allowed_attrs = {
            "a": {"href", "target", "rel"},
        }
        self.tag_stack = []

    def handle_starttag(self, tag, attrs):
        if tag in self.allowed_tags:
            attr_str = ""
            valid_attrs = []
            for name, value in attrs:
                if tag in self.allowed_attrs and name in self.allowed_attrs[tag]:
                    if name == "href":
                        parsed = urlparse(value)
                        # Allow relative or http/https/mailto
                        if parsed.scheme and parsed.scheme not in ("http", "https", "mailto"):
                            continue
                    valid_attrs.append(f'{name}="{self.escape_attr(value)}"')
            
            if valid_attrs:
                attr_str = " " + " ".join(valid_attrs)
            
            self.result.append(f"<{tag}{attr_str}>")
            self.tag_stack.append(tag)

    def handle_endtag(self, tag):
        if tag in self.allowed_tags:
            if self.tag_stack and self.tag_stack[-1] == tag:
                self.tag_stack.pop()
                self.result.append(f"</{tag}>")
            elif tag in self.tag_stack:
                while self.tag_stack:
                    closed_tag = self.tag_stack.pop()
                    self.result.append(f"</{closed_tag}>")
                    if closed_tag == tag:
                        break

    def handle_data(self, data):
        self.result.append(self.escape_text(data))

    def escape_text(self, text):
        return text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")

    def escape_attr(self, text):
        return text.replace("&", "&amp;").replace('"', "&quot;").replace("<", "&lt;").replace(">", "&gt;")

    def get_safe_html(self):
        while self.tag_stack:
            closed_tag = self.tag_stack.pop()
            self.result.append(f"</{closed_tag}>")
        return "".join(self.result)

def sanitize_html(html_content: str) -> str:
    if not html_content:
        return ""
    parser = SafeHTMLParser()
    parser.feed(html_content)
    return parser.get_safe_html()
