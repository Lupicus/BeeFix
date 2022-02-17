var asmapi = Java.type('net.minecraftforge.coremod.api.ASMAPI')
var opc = Java.type('org.objectweb.asm.Opcodes')
var AbstractInsnNode = Java.type('org.objectweb.asm.tree.AbstractInsnNode')
var InsnNode = Java.type('org.objectweb.asm.tree.InsnNode')
var JumpInsnNode = Java.type('org.objectweb.asm.tree.JumpInsnNode')
var LabelNode = Java.type('org.objectweb.asm.tree.LabelNode')
var LdcInsnNode = Java.type('org.objectweb.asm.tree.LdcInsnNode')
var MethodNode = Java.type('org.objectweb.asm.tree.MethodNode')
var VarInsnNode = Java.type('org.objectweb.asm.tree.VarInsnNode')

function initializeCoreMod() {
    return {
    	'Bee': {
    		'target': {
    			'type': 'CLASS',
    			'name': 'net.minecraft.entity.passive.BeeEntity'
    		},
    		'transformer': function(classNode) {
    			var count = 0
    			var found2 = false
    			var fn = asmapi.mapMethod('func_70037_a') // readAdditional
    			var fn2 = asmapi.mapMethod('func_213386_a') // onInitialSpawn
    			for (var i = 0; i < classNode.methods.size(); ++i) {
    				var obj = classNode.methods.get(i)
    				if (obj.name == fn) {
    					patch_func_70037_a(obj)
    					count++
    				}
    				else if (obj.name == fn2) {
    					found2 = true
    					patch_func_213386_a(obj)
    					count++
    				}
    			}
    			if (!found2) {
					insert_func_213386_a(classNode, fn2)
					count++
    			}
    			if (count < 2)
    				asmapi.log("ERROR", "Failed to modify BeeEntity: Method not found")
    			return classNode;
    		}
    	}
    }
}

// add conditional setNoGravity call
function patch_func_70037_a(obj) {
	var node = asmapi.findFirstInstruction(obj, opc.RETURN)
	if (node) {
		var f1 = asmapi.mapMethod('func_74764_b') // contains
		var n1 = "net/minecraft/nbt/CompoundNBT"
		var f2 = asmapi.mapMethod('func_189654_d') // setNoGravity
		var n2 = "net/minecraft/entity/MobEntity"
		var op8 = new LabelNode()
		var op1 = new VarInsnNode(opc.ALOAD, 1)
		var op2 = new LdcInsnNode("NoGravity")
		var op3 = asmapi.buildMethodCall(n1, f1, "(Ljava/lang/String;)Z", asmapi.MethodType.VIRTUAL)
		var op4 = new JumpInsnNode(opc.IFNE, op8)
		var op5 = new VarInsnNode(opc.ALOAD, 0)
		var op6 = new InsnNode(opc.ICONST_1)
		var op7 = asmapi.buildMethodCall(n2, f2, "(Z)V", asmapi.MethodType.VIRTUAL)
		var list = asmapi.listOf(op1, op2, op3, op4, op5, op6, op7, op8)
		obj.instructions.insertBefore(node, list)
	}
	else
		asmapi.log("ERROR", "Failed to modify BeeEntity: RETURN not found")
}

function setNoGravity(obj, node) {
	var f2 = asmapi.mapMethod('func_189654_d') // setNoGravity
	var n2 = "net/minecraft/entity/MobEntity"
	var op1 = new VarInsnNode(opc.ALOAD, 0)
	var op2 = new InsnNode(opc.ICONST_1)
	var op3 = asmapi.buildMethodCall(n2, f2, "(Z)V", asmapi.MethodType.VIRTUAL)
	var list = asmapi.listOf(op1, op2, op3)
	if (node)
		obj.instructions.insertBefore(node, list)
	else
		obj.instructions.add(list)
}

// add setNoGravity call
function patch_func_213386_a(obj) {
	var node = obj.instructions.getFirst()
	if (node.getType() == AbstractInsnNode.LABEL)
		node = node.getNext()
	setNoGravity(obj, node)
}

// add setNoGravity call
function insert_func_213386_a(cobj, fn) {
	var desc = "(Lnet/minecraft/world/IServerWorld;Lnet/minecraft/world/DifficultyInstance;Lnet/minecraft/entity/SpawnReason;Lnet/minecraft/entity/ILivingEntityData;Lnet/minecraft/nbt/CompoundNBT;)Lnet/minecraft/entity/ILivingEntityData;"
	var obj = new MethodNode(opc.ACC_PUBLIC, fn, desc, null, null)
	cobj.methods.add(obj)
	setNoGravity(obj, null)
	var op1 = new VarInsnNode(opc.ALOAD, 0)
	var op2 = new VarInsnNode(opc.ALOAD, 1)
	var op3 = new VarInsnNode(opc.ALOAD, 2)
	var op4 = new VarInsnNode(opc.ALOAD, 3)
	var op5 = new VarInsnNode(opc.ALOAD, 4)
	var op6 = new VarInsnNode(opc.ALOAD, 5)
	var op7 = asmapi.buildMethodCall("net/minecraft/entity/passive/AnimalEntity", fn, desc, asmapi.MethodType.SPECIAL)
	var op8 = new InsnNode(opc.ARETURN)
	var list = asmapi.listOf(op1, op2, op3, op4, op5, op6, op7, op8)
	obj.instructions.add(list)
}
