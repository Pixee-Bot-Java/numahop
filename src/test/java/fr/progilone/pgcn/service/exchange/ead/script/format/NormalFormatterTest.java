package fr.progilone.pgcn.service.exchange.ead.script.format;

import fr.progilone.pgcn.domain.jaxb.ead.ObjectFactory;
import fr.progilone.pgcn.domain.jaxb.ead.Persname;
import fr.progilone.pgcn.service.exchange.ead.script.AbstractScriptTest;
import org.junit.Test;

import javax.script.ScriptException;
import java.util.HashMap;
import java.util.Map;

import static org.junit.Assert.*;

public class NormalFormatterTest extends AbstractScriptTest {

    private static final ObjectFactory OBJECT_FACTORY = new ObjectFactory();

    @Test
    public void testGroovyNormalContent() throws ScriptException {
        final Persname persname = OBJECT_FACTORY.createPersname();
        persname.getContent().add("contenu");

        final String expression = "normal(var_test)";

        final Map<String, Object> bindings = new HashMap<>();
        bindings.put("var_test", persname);

        final Object actual = evalUserScript(expression, null, bindings, new NormalFormatter("test"));

        assertEquals("contenu", actual);
    }

    @Test
    public void testGroovyNormalNormal() throws ScriptException {
        final Persname persname = OBJECT_FACTORY.createPersname();
        persname.setNormal("normal");
        persname.getContent().add("contenu");

        final String expression = "normal(var_test)";

        final Map<String, Object> bindings = new HashMap<>();
        bindings.put("var_test", persname);

        final Object actual = evalUserScript(expression, null, bindings, new NormalFormatter("test"));

        assertEquals("normal", actual);
    }
}
