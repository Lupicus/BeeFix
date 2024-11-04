var asmapi = Java.type('net.minecraftforge.coremod.api.ASMAPI')
var opc = Java.type('org.objectweb.asm.Opcodes')
var InsnNode = Java.type('org.objectweb.asm.tree.InsnNode')
var LdcInsnNode = Java.type('org.objectweb.asm.tree.LdcInsnNode')
var MethodNode = Java.type('org.objectweb.asm.tree.MethodNode')
var TypeInsnNode = Java.type('org.objectweb.asm.tree.TypeInsnNode')
var VarInsnNode = Java.type('org.objectweb.asm.tree.VarInsnNode')

function initializeCoreMod() {
    return {
    	'BeeRenderer': {
    		'target': {
    			'type': 'CLASS',
    			'name': 'net.minecraft.client.renderer.entity.BeeRenderer'
    		},
    		'transformer': function(classNode) {
    			var count = 0
    			var found = false
    			var fn = "getFlipDegrees"
    			for (var i = 0; i < classNode.methods.size(); ++i) {
    				var obj = classNode.methods.get(i)
    				if (obj.name == fn) {
    					found = true
    				}
    			}
    			count++
    			if (!found) {
    				insert_getFD(classNode, fn)
    			}
    			else
    				asmapi.log("INFO", "BeeRenderer patch being skipped; not needed in this version")
    			if (count < 1)
    				asmapi.log("ERROR", "Failed to modify BeeRenderer: Method not found")
    			return classNode;
    		}
    	}
    }
}

function insert_getFD(cobj, fn) {
	var desc = "()F"
	var obj = new MethodNode(opc.ACC_PROTECTED, fn, desc, null, null)
	cobj.methods.add(obj)
	var op1 = asmapi.buildNumberLdcInsnNode(180.0, asmapi.NumberType.FLOAT)
	var op2 = new InsnNode(opc.FRETURN)
	var list = asmapi.listOf(op1, op2)
	obj.instructions.add(list)
}
